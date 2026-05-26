import { Type } from "@sinclair/typebox";
import { Result } from "./result.js";

const EPRINT_SEARCH_URL = "https://eprint.iacr.org/search";
const DEFAULT_MAX_RESULTS = 10;
const MAX_RESULTS_LIMIT = 50;
const ABSTRACT_MAX_CHARS = 300;

export const EprintSearchSchema = Type.Object({
  query: Type.String({ description: "Search query for IACR ePrint papers (e.g. 'lattice-based KEM' or 'ML-KEM side channel')." }),
  max_results: Type.Optional(
    Type.Number({
      description: "Maximum number of results to return (1-50). Default: 10.",
      minimum: 1,
      maximum: MAX_RESULTS_LIMIT,
    }),
  ),
  date_from: Type.Optional(
    Type.String({
      description: "Filter papers submitted after this date (YYYY-MM-DD).",
    }),
  ),
});

type EprintPaper = {
  title: string;
  authors: string[];
  abstract: string;
  eprintId: string;
  htmlUrl: string;
  pdfUrl: string;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function assertDate(date: string | undefined): string | undefined {
  if (!date) return undefined;
  if (!DATE_RE.test(date)) throw new Error("date_from must use YYYY-MM-DD");
  return date;
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parseEprintHtml(html: string): EprintPaper[] {
  const papers: EprintPaper[] = [];
  const seen = new Set<string>();
  // Match anchor tags pointing to ePrint IDs like /2024/1234
  const anchorRegex = /<a[^>]+href="(?:https?:\/\/eprint\.iacr\.org)?\/(\d{4}\/\d{1,5})"[^>]*>([\s\S]*?)<\/a>([\s\S]{0,400})/g;
  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(html)) !== null) {
    const eprintId = match[1];
    if (seen.has(eprintId)) continue;

    const linkText = stripTags(match[2]);
    const trailing = stripTags(match[3]);
    // Bare "2024/1234" link text is just a navigation link, not a title
    const looksLikeId = /^\d{4}\/\d{1,5}$/.test(linkText);
    const title = looksLikeId ? "" : linkText;
    const snippet = trailing.slice(0, ABSTRACT_MAX_CHARS);

    seen.add(eprintId);
    papers.push({
      title: title || `ePrint ${eprintId}`,
      authors: [],
      abstract: snippet,
      eprintId,
      htmlUrl: `https://eprint.iacr.org/${eprintId}`,
      pdfUrl: `https://eprint.iacr.org/${eprintId}.pdf`,
    });
  }
  return papers;
}

/**
 * eprint_search: Search IACR ePrint for cryptography papers.
 * Covers crypto preprints not yet indexed on arXiv; critical for PQC, protocols, and cryptanalysis.
 */
export function createEprintSearchTool() {
  return {
    label: "IACR ePrint Search",
    name: "eprint_search",
    description:
      "Search IACR ePrint archive for cryptography preprints. Covers papers not yet on arXiv — essential for PQC, protocols, cryptanalysis, and side-channel research.",
    parameters: EprintSearchSchema,
    execute: async (_toolCallId: string, rawArgs: unknown) => {
      const params = rawArgs as Record<string, unknown>;

      const query = String(params["query"] ?? "").trim();
      if (!query) return Result.err("invalid_param", "query must be non-empty");

      let dateFrom: string | undefined;
      try {
        dateFrom = assertDate(params["date_from"] as string | undefined);
      } catch (e) {
        return Result.err("invalid_param", (e as Error).message);
      }

      const rawMax = params["max_results"];
      const maxResults = Math.min(
        Math.max(1, rawMax != null ? Math.floor(Number(rawMax)) : DEFAULT_MAX_RESULTS),
        MAX_RESULTS_LIMIT,
      );

      const urlParams = new URLSearchParams({ q: query });
      if (dateFrom) urlParams.set("submittedafter", dateFrom);
      const url = `${EPRINT_SEARCH_URL}?${urlParams.toString()}`;

      let response: Response;
      try {
        response = await fetch(url);
      } catch (error) {
        return Result.err(
          "network_error",
          `Failed to reach IACR ePrint: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      if (!response.ok) {
        return Result.err("api_error", `IACR ePrint returned ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const papers = parseEprintHtml(html).slice(0, maxResults);

      return Result.ok({
        query,
        source: "iacr_eprint",
        total: papers.length,
        papers: papers.map((p) => ({
          title: p.title,
          authors: p.authors,
          abstract:
            p.abstract.length > ABSTRACT_MAX_CHARS ? p.abstract.slice(0, ABSTRACT_MAX_CHARS) + "…" : p.abstract,
          eprint_id: p.eprintId,
          paper_id: `eprint:${p.eprintId}`,
          html_url: p.htmlUrl,
          pdf_url: p.pdfUrl,
        })),
        ...(papers.length === 0
          ? {
              note: "No results parsed. ePrint markup may have changed — verify on https://eprint.iacr.org/search.",
            }
          : {}),
      });
    },
  };
}

# Crypto Glossary Reference

Pre-audited terms for cryptography research. Definitions match canonical sources.

---

## crypto-core

**IND-CPA** (选择明文攻击下不可区分性)
Indistinguishability under chosen-plaintext attack: no polynomial-time adversary can distinguish encryptions of two adversary-chosen plaintexts with non-negligible advantage, given only access to the encryption oracle.
*Ref: Goldwasser & Micali, Probabilistic Encryption, JCSS 1984*

**IND-CCA1** (懒选择密文攻击下不可区分性)
The adversary may query the decryption oracle before but not after receiving the challenge ciphertext ("lunchtime attack").
*Ref: Naor & Yung, STOC 1990*

**IND-CCA2** (自适应选择密文攻击下不可区分性)
The adversary may continue querying the decryption oracle after seeing the challenge ciphertext (excluding the challenge itself). Gold-standard for PKE and KEMs.
*Ref: Rackoff & Simon, CRYPTO 1991*

**KEM** (密钥封装机制)
Key Encapsulation Mechanism: (KeyGen, Encaps, Decaps). Encaps produces ciphertext c plus shared secret K; Decaps recovers K from c. Standard PKE-replacement for hybrid encryption.
*Ref: Shoup, ISO public key encryption proposal, 2001*

**AEAD** (带关联数据的认证加密)
Symmetric primitive providing confidentiality of the plaintext and integrity/authenticity of both the plaintext and associated data under a single key.
*Ref: Rogaway, CCS 2002*

**KAT** (已知答案测试)
Known Answer Test: reference test vector tying a fixed input to its expected output. NIST competitions require KAT files alongside reference implementations.
*Ref: NIST SP 800-22 / PQC submission guidance*

**ROM** (随机预言机模型)
Hash functions modeled as uniformly random functions accessible only via oracle queries. Proofs in ROM do not automatically transfer to QROM.
*Ref: Bellare & Rogaway, CCS 1993*

**game-hopping** (博弈跳跃证明)
Proof technique: transform the security game through G_0, G_1, ..., G_k linked by indistinguishability or failure-event bounds, bounding the adversary's advantage in the final game directly.
*Ref: Bellare & Rogaway, EUROCRYPT 2006*

**advantage** (优势)
Absolute deviation of adversary's success probability from the trivial baseline (typically 1/2 for distinguishing, 0 for unforgeability). Notation: Adv_game^scheme(A).
*Ref: Bellare et al., CRYPTO 1998*

**negligible** (可忽略)
Function negl(n) decaying faster than any inverse polynomial. Security definitions require adversary advantages to be negligible in the security parameter.
*Ref: Goldreich, Foundations of Cryptography Vol. 1, §1.3*

**PRF** (伪随机函数)
Keyed function F_K(·) indistinguishable from a uniformly random function under oracle access.
*Ref: Goldreich, Goldwasser, Micali, JACM 1986*

**PRP** (伪随机置换)
Keyed permutation indistinguishable from a uniformly random permutation. Block ciphers are modeled as PRPs; the PRP-PRF switching lemma bounds the gap.
*Ref: Luby & Rackoff, SIAM 1988*

---

## pqc

**QROM** (量子随机预言机模型)
Like ROM but the adversary may issue quantum (superposition) queries. Many ROM proofs do not transfer because rewinding-based techniques interact badly with superposition queries.
*Ref: Boneh et al., ASIACRYPT 2011*

**FO transform** (FO 变换)
Fujisaki-Okamoto: converts IND-CPA-secure PKE/KEM into IND-CCA-secure variant in ROM by re-encrypting and comparing during decryption.
*Ref: Fujisaki & Okamoto, CRYPTO 1999; QROM tight variant: Hofheinz, Hövelmanns, Kiltz, TCC 2017*

**lattice** (格)
Discrete additive subgroup of R^n, L(B) = {Bx : x ∈ Z^n}. Lattice problems (SVP, CVP, LWE) underpin most post-quantum cryptography.
*Ref: Micciancio & Goldwasser, Kluwer 2002*

**LWE** (带误差学习问题)
Given (A, As+e) where s is secret and e is small noise, distinguish from uniform / recover s. Foundational hardness assumption for post-quantum lattice cryptography.
*Ref: Regev, STOC 2005 / JACM 2009*

**RLWE** (环上带误差学习问题)
LWE over R_q = Z_q[X]/f(X). Smaller keys than plain LWE; underpins Kyber, FrodoKEM, NewHope.
*Ref: Lyubashevsky, Peikert, Regev, EUROCRYPT 2010*

**Module-LWE** (模上带误差学习问题)
LWE over module lattices, generalizing both LWE and RLWE. ML-KEM (FIPS 203) and ML-DSA (FIPS 204) are based on Module-LWE.
*Ref: Langlois & Stehlé, DCC 2015*

**NTRU**
Polynomial-ring lattice scheme with shorter keys/ciphertexts than RLWE-based KEMs. NIST PQC round-3 alternate; used in practice (NTRU-HRSS, NTRU-Prime).
*Ref: Hoffstein, Pipher, Silverman, ANTS 1998*

**DFR** (解密失败率)
Decryption Failure Rate: probability of incorrect decryption by legitimate parties. Lattice KEMs with non-zero DFR require DFR ≤ 2^-λ for IND-CCA proofs.
*Ref: D'Anvers et al., EUROCRYPT 2020*

**KyberSlash**
Side-channel timing leak via secret-dependent integer division found in several Kyber/ML-KEM implementations in 2024. Implementation-level defect, not a design flaw.
*Ref: Bernstein et al., KyberSlash advisory, 2024*

**ML-KEM** (ML-KEM, FIPS 203)
NIST FIPS 203 (2024) standardized CRYSTALS-Kyber. Three parameter sets: ML-KEM-512/768/1024, targeting NIST security levels 1/3/5.
*Ref: NIST FIPS 203, August 2024*

---

## theory

**tightness** (证明紧度)
Ratio between adversary's advantage in the security game and advantage transferred to the hardness assumption. Tight = constant loss; loose = polynomial/exponential loss → larger concrete parameters.
*Ref: Bader et al., PKC 2015*

**reduction** (归约)
Polynomial-time algorithm B that, given black-box access to adversary A breaking the scheme, solves an underlying hard problem with related advantage.
*Ref: Goldwasser & Micali, JCSS 1984*

**simulation-based security** (模拟安全)
A protocol is secure if for every real-world adversary there exists an ideal-world simulator producing an indistinguishable view. Typical in MPC and ZK proofs.
*Ref: Canetti, JoC 2000*

**UC framework** (通用可组合性框架)
Security framework where protocols proven secure compose under arbitrary concurrent execution. Requires setup assumptions (CRS, PKI).
*Ref: Canetti, FOCS 2001*

**composability** (可组合性)
Security guarantee for a primitive in isolation is preserved when used inside larger protocols. UC composability is strongest; weaker: sequential and concurrent composition.
*Ref: Canetti, op. cit.; Lindell, Springer 2003*

**hybrid argument** (杂交论证)
Proof technique: bound the distance between two distributions by inserting a chain of intermediate distributions, each indistinguishable from its neighbor, and summing via the triangle inequality.
*Ref: Goldreich, Foundations of Cryptography Vol. 1, §3.2.3*

**programmable RO** (可编程随机预言机)
ROM variant where the reduction may program oracle output on selected inputs before the adversary queries. Required by many tight reductions; criticized for masking real hash assumptions.
*Ref: Fischlin et al., ASIACRYPT 2010*

**Dolev-Yao** (Dolev-Yao 模型)
Symbolic adversary model: attacker fully controls the network but treats cryptographic primitives as perfect black boxes. Used by Tamarin and ProVerif.
*Ref: Dolev & Yao, IEEE TIT 1983*

---

## side-channel

**constant-time** (常时间实现)
Execution time and memory access pattern are independent of secret values. Standard mitigation for timing and cache side-channel attacks; verifiable via dudect, ctgrind, binsec/rel2.
*Ref: Bernstein, cache-timing attacks on AES, 2005; Pornin, BearSSL constant-time guidelines*

**single-trace SCA** (单轨迹侧信道攻击)
Attack that recovers the secret using exactly one measurement trace. Particularly threatening to PQC implementations because ephemeral KEM keys cannot be re-used by the victim.
*Ref: Primas, Pessl, Mangard, CHES 2017*

**template attack** (模板攻击)
Profiled SCA: build Gaussian (or learned) templates for each candidate secret value on a clone device, then match a single victim trace. Strongest classical profiled SCA.
*Ref: Chari, Rao, Rohatgi, CHES 2002*

**profiled SCA** (profiled 侧信道攻击)
Attacker has access to a clone device to build a leakage model offline, then mounts the attack with very few (often single) traces. Distinct from non-profiled (CPA/DPA-style) attacks.
*Ref: Standaert, Malkin, Yung, EUROCRYPT 2009*

**masking** (掩码)
Split each sensitive intermediate value into d+1 shares such that any d shares are independent of the secret. d-th order masking resists attacks observing up to d values; proven in probing/noisy-leakage model.
*Ref: Ishai, Sahai, Wagner, CRYPTO 2003; Goudarzi & Rivain, EUROCRYPT 2017*

**threshold implementation** (门限实现)
Masking countermeasure where each non-linear gate satisfies non-completeness, correctness, and uniformity. Provably first-order glitch-resistant.
*Ref: Nikova, Rechberger, Rijmen, ICICS 2006*

**glitches** (毛刺)
Transient sub-cycle signal transitions in combinational logic that can leak masked secrets even when steady-state masking is information-theoretically secure. Defeated by TI and DOM.
*Ref: Mangard, Pramstaller, Oswald, CHES 2005*

**fault injection** (故障注入)
Active attack: induce transient computation errors (voltage glitches, clock manipulation, laser, EM pulses) to bypass security checks or leak secret material.
*Ref: Boneh, DeMillo, Lipton, EUROCRYPT 1997*

**dudect**
Statistical tool for empirically testing constant-time execution: measures execution time under two input classes, applies a t-test. Black-box; no source modification required.
*Ref: Reparaz, Balasch, Verbauwhede, DATE 2017*

**TVLA** (测试向量泄漏评估)
Test Vector Leakage Assessment: evaluate side-channel leakage via Welch's t-test on fixed-vs-random key/plaintext trace sets. NIST-style standard for SCA evaluation.
*Ref: Goodwill et al., NIST NIAT Workshop 2011*

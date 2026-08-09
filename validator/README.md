# DuraShare Validator (JS Dev Tool)

[![Security: Unaudited](https://img.shields.io/badge/Security-Unaudited-orange)](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md)
[![CI](https://github.com/GRIFORTIS/durashare-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/GRIFORTIS/durashare-js/actions/workflows/ci.yml)
[![CodeQL](https://github.com/GRIFORTIS/durashare-js/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/GRIFORTIS/durashare-js/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**DuraShare: BIP39-Native Threshold Backup over GF(2053) with Full Manual Fallback and Per-Share Audit**

DuraShare uses Shamir secret sharing to split a **standard BIP39** recovery phrase into **k-of-n** durable, human-readable shares in an offline, software-assisted experience, **while keeping all the math executable manually on paper**. It also allows **individual geographically distributed shares to be verified** before recovery, without gathering a threshold or revealing the secret.

DuraShare **modifies existing, well-established cryptographic techniques** for human-friendly threshold backup. This validator is thoroughly tested, published in good faith **as is**, and has **not** been independently audited. **Do not use with real funds.** See [Disclaimer](#disclaimer).

Single-file, browser-based validator for the DuraShare JavaScript/TypeScript library. This is a **development/auditing tool** for testing, conformance checks, and demonstrations — not a wallet tool.

> **Note:** This tool tracks the JS library and is not yet full protocol v0.7.0.

---

## What is this?

This validator lets you:
- Create shares from a BIP39 mnemonic using the JS library
- Recover a BIP39 mnemonic from shares
- Surface validation failures and integrity checks interactively (row, column, GIC)

It is distributed as a signed HTML file in GitHub Releases and can also be run locally from this repository.

---

## Links

- **Main JS library**: [`../README`](../README.md)
- **Canonical protocol + specs**: [durashare](https://github.com/GRIFORTIS/durashare)
- **Test vectors**: [TEST_VECTORS](https://github.com/GRIFORTIS/durashare/blob/main/test_vectors/README.md)
- **Canonical security posture**: [SECURITY](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md)

---

## Security

This tool implements well-established cryptographic principles but has **NOT** been professionally audited.

**Use only for**: testing, learning, experimentation.

**Security policy / vulnerability reporting**: see [SECURITY](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md).

---

## Verify Before Use (Required)

**CRITICAL**: Before opening a downloaded validator HTML, verify it hasn't been tampered with.

Releases include:
- Validator HTML: `validator/dist/durashare-validator-vX.Y.Z.html` (+ `.asc` + `.sha256`)
- Checksums: `validator/CHECKSUMS-VALIDATOR.txt` (+ `.asc`)

> **Note:** Older releases used `schiavinato-validator-vX.Y.Z.html`. Keep those GitHub Release assets as published history.

### 1. Import GRIFORTIS Public Key (One-Time)

```bash
curl -fsSL https://raw.githubusercontent.com/GRIFORTIS/durashare-js/main/GRIFORTIS-PGP-PUBLIC-KEY.asc | gpg --import
gpg --fingerprint security@grifortis.com
```

**Expected**: `7921 FD56 9450 8DA4 020E  671F 4CFE 6248 C57F 15DF`

### 2. Verify Signatures

```bash
gpg --verify CHECKSUMS-VALIDATOR.txt.asc CHECKSUMS-VALIDATOR.txt
gpg --verify durashare-validator-vX.Y.Z.html.asc durashare-validator-vX.Y.Z.html
```

---

## Usage

### Option A: Run locally (recommended for development)

From the `durashare-js/` repo root:

```bash
npm ci
npm run build
npm run build:validator
npm run validator
```

Then open:
- `http://localhost:8080/validator/JS_Library_Validator.html`

### Option B: Use the signed HTML from GitHub Releases

Download the latest validator HTML and verify it as described above, then open it in a browser.

---

## Conformance Validation

This validator complements automated testing and canonical test vectors:
- [TEST_VECTORS](https://github.com/GRIFORTIS/durashare/blob/main/test_vectors/README.md)

---

## People

### Renato Schiavinato Lopez — Founder & Protocol Author
- Creator of DuraShare.
- [LinkedIn](https://www.linkedin.com/in/renato-agile-coach/) · [GitHub](https://github.com/renatoslopes)

### Jeroen van de Graaf — Chief Scientist; Advisory Board
- Professor, DCC–UFMG. Cryptographer (ZK, MPC, privacy, applied protocols); PhD, Université de Montréal (1997).
- [DCC/UFMG](https://dcc.ufmg.br/professor/jeroen-van-de-graaf/) · [DBLP](https://dblp.org/pid/27/6925.html) · [Lattes](http://lattes.cnpq.br/0069989873499216) · [Google Scholar](https://scholar.google.com.br/citations?user=-w8olWwAAAAJ)

## License

[MIT License](../LICENSE)

## Disclaimer

Software has been thoroughly tested and is not known to contain errors. It is made available in good faith, as is, so use at your own risk. The author does not assume any responsibility for any damage, financial or other, that may result from using this software. Reference implementations have not been independently audited. **Do not use with real funds.** See [SECURITY](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md).

---

**Maintained by**: [GRIFORTIS](https://github.com/GRIFORTIS)

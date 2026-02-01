# Schiavinato Sharing Validator (JS Dev Tool)

[![Security: Experimental](https://img.shields.io/badge/Security-⚠️%20EXPERIMENTAL%20⚠️-red)](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/SECURITY.md)
[![CI](https://github.com/GRIFORTIS/schiavinato-sharing-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/GRIFORTIS/schiavinato-sharing-js/actions/workflows/ci.yml)
[![CodeQL](https://github.com/GRIFORTIS/schiavinato-sharing-js/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/GRIFORTIS/schiavinato-sharing-js/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> ## ⚠️ WARNING: EXPERIMENTAL SOFTWARE ⚠️
> 
>DO NOT USE IT FOR REAL FUNDS!
>
> Schiavinato Sharing specification and implementations have NOT been audited. Use for testing, learning, and experimentation only. See [SECURITY](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/SECURITY.md) for details.
>
>We invite **cryptographers** and **developers** to review the spec and software. See [CONTRIBUTING](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/CONTRIBUTING.md) to know more.

Single-file, browser-based validator for the JavaScript/TypeScript library. This is a **development/auditing tool** for testing, conformance checks, and demonstrations — not a wallet tool.

---

## What is this?

This validator lets you:
- Create shares from a BIP39 mnemonic using the JS library
- Recover a BIP39 mnemonic from shares
- Surface validation failures and integrity checks interactively

It is distributed as a signed HTML file in GitHub Releases and can also be run locally from this repository.

**NPM status (important):** The NPM package `@grifortis/schiavinato-validator` exists for historical reasons but is **deprecated** and **must not** be used as a distribution channel. Use the signed GitHub Release assets instead.

---

## Links

- **Main JS library**: [`../README.md`](../README.md)
- **Canonical protocol + specs**: [schiavinato-sharing](https://github.com/GRIFORTIS/schiavinato-sharing)
- **Test vectors**: [TEST_VECTORS](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/TEST_VECTORS.md)
- **Canonical security posture**: [SECURITY](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/SECURITY.md)

---

## Security

This tool implements well-established cryptographic principles but has **NOT** been professionally audited.

**Use only for**: testing, learning, experimentation.

**Security policy / vulnerability reporting**: see the canonical process in `schiavinato-sharing/SECURITY.md`.

---

## Verify Before Use (Required)

**CRITICAL**: Before opening a downloaded validator HTML, verify it hasn't been tampered with.

Releases include:
- Validator HTML: `validator/dist/schiavinato-validator-vX.Y.Z.html` (+ `.asc` + `.sha256`)
- Checksums: `validator/CHECKSUMS-VALIDATOR.txt` (+ `.asc`)

### 1. Import GRIFORTIS Public Key (One-Time)

```bash
curl -fsSL https://raw.githubusercontent.com/GRIFORTIS/schiavinato-sharing-js/main/GRIFORTIS-PGP-PUBLIC-KEY.asc | gpg --import
gpg --fingerprint security@grifortis.com
```

**Expected**: `7921 FD56 9450 8DA4 020E  671F 4CFE 6248 C57F 15DF`

### 2. Verify Signatures

```bash
gpg --verify CHECKSUMS-VALIDATOR.txt.asc CHECKSUMS-VALIDATOR.txt
gpg --verify schiavinato-validator-vX.Y.Z.html.asc schiavinato-validator-vX.Y.Z.html
```

---

## Usage

### Option A: Run locally (recommended for development)

From the `schiavinato-sharing-js/` repo root:

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
- [TEST_VECTORS](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/TEST_VECTORS.md)

---

## License

[MIT License](LICENSE)


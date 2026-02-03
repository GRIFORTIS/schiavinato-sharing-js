# Schiavinato Sharing (JS/TS)

[![Security: Experimental](https://img.shields.io/badge/Security-⚠️%20EXPERIMENTAL%20⚠️-red)](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/.github/SECURITY.md)
[![CI](https://github.com/GRIFORTIS/schiavinato-sharing-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/GRIFORTIS/schiavinato-sharing-js/actions/workflows/ci.yml)
[![CodeQL](https://github.com/GRIFORTIS/schiavinato-sharing-js/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/GRIFORTIS/schiavinato-sharing-js/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js/graph/badge.svg)](https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js)
[![npm version](https://img.shields.io/npm/v/@grifortis/schiavinato-sharing.svg)](https://www.npmjs.com/package/@grifortis/schiavinato-sharing)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> ## ⚠️ WARNING: EXPERIMENTAL SOFTWARE ⚠️
> 
>DO NOT USE IT FOR REAL FUNDS!
>
> Schiavinato Sharing specification and implementations have NOT been audited. Use for testing, learning, and experimentation only. See [SECURITY](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/.github/SECURITY.md) for details.
>
>We invite **cryptographers** and **developers** to review the spec and software. See [CONTRIBUTING](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/.github/CONTRIBUTING.md) to know more.

JavaScript/TypeScript implementation of **Schiavinato Sharing**: dual-mode (manual + software) \(k\)-of-\(n\) threshold secret sharing for **BIP39 mnemonics** over **GF(2053)**. Designed for offline/air-gapped workflows, with manual-fallback compatibility.

---

## What is this?

**Schiavinato Sharing** is a dual-mode (**manual + software**) \(k\)-of-\(n\) threshold secret sharing scheme for **BIP39 mnemonics**. It operates directly on the **1-indexed BIP39 word indices** over the prime field **GF(2053)**, so the recovered secret is a standard BIP39 mnemonic compatible with modern wallets.

**In this JS implementation, you can:**

- Split a BIP39 mnemonic into \(k\)-of-\(n\) shares (`Share[]`)
- Recover the original BIP39 mnemonic from \(k\) shares (`RecoveryResult`)
- Validate inputs and share integrity during split/recovery to prevent silent mistakes

---

## Links

- **Canonical protocol + specs**: [schiavinato-sharing](https://github.com/GRIFORTIS/schiavinato-sharing)
- **Whitepaper**: [PDF](https://github.com/GRIFORTIS/schiavinato-sharing/releases/latest/download/WHITEPAPER.pdf) | [LaTeX](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/whitepaper/WHITEPAPER.tex)
- **Test Vectors**: [TEST_VECTORS](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/test_vectors/README.md)
- **Canonical security posture**: [SECURITY](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/.github/SECURITY.md)
- **HTML implementation**: [schiavinato-sharing-html](https://github.com/GRIFORTIS/schiavinato-sharing-html)
- **Python implementation**: [schiavinato-sharing-py](https://github.com/GRIFORTIS/schiavinato-sharing-py)
- **Validator (dev tool)**: [`validator/README.md`](./validator/README.md)

---

## Security

This library implements well-established cryptographic principles but has **NOT** been professionally audited.

**Use only for**: testing, learning, experimentation.

**Canonical security posture**: [schiavinato-sharing/SECURITY](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/.github/SECURITY.md)

---

## Verify Before Use (Required)

**CRITICAL**: Before using with real crypto seeds, verify the package and/or release artifacts haven't been tampered with.

### Option A: Verify release artifacts (recommended for highest assurance)

This repository's releases include:
- `CHECKSUMS-LIBRARY.txt` (+ detached signature `CHECKSUMS-LIBRARY.txt.asc`)
- A signed release tarball `schiavinato-sharing-vX.Y.Z.tar.gz` (+ `*.asc` + `*.sha256`)

Import the GRIFORTIS public key and verify signatures before use.

```bash
curl -fsSL https://raw.githubusercontent.com/GRIFORTIS/schiavinato-sharing-js/main/GRIFORTIS-PGP-PUBLIC-KEY.asc | gpg --import
gpg --fingerprint security@grifortis.com
```

**Expected**: `7921 FD56 9450 8DA4 020E  671F 4CFE 6248 C57F 15DF`

Then verify release assets (examples):

```bash
gpg --verify CHECKSUMS-LIBRARY.txt.asc CHECKSUMS-LIBRARY.txt
gpg --verify schiavinato-sharing-vX.Y.Z.tar.gz.asc schiavinato-sharing-vX.Y.Z.tar.gz
```

If you've built the library locally, you can also verify the built outputs against the latest release checksums:

```bash
npm run build
npm run build:browser
npm run verify:latest
```

### Option B: Verify the NPM tarball identity (supply-chain sanity check)

For NPM installs, verify the published tarball matches the tag/build:
- Compare `dist.shasum` / `dist.integrity` from `npm view` against the values produced by `npm pack --json`
- Pin exact versions and use lockfiles for repeatable installs

---

## Installation

```bash
npm install @grifortis/schiavinato-sharing
```

---

## Quick Start

### Split a mnemonic

```ts
import { recoverMnemonic, splitMnemonic } from '@grifortis/schiavinato-sharing';

async function main() {
  const mnemonic =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

  const shares = await splitMnemonic(mnemonic, 2, 3);
  const result = await recoverMnemonic([shares[0], shares[1]], 12);

  if (!result.success) throw new Error(String(result.errors.generic ?? 'Recovery failed'));
  console.log(result.mnemonic);
}

main();
```

### Recover a mnemonic

Use `recoverMnemonic(shares, wordCount)` and check `result.success` (it returns a report object instead of throwing on validation failures).

---

## API Reference (high-level)

Stable entry points:
- `splitMnemonic(mnemonic, k, n, options?)` (async)
- `recoverMnemonic(shares, wordCount, options?)` (async)
- `validateBip39Mnemonic(mnemonic)`

Advanced exports (field arithmetic, Lagrange helpers, checksum helpers, secure wipe utilities) are also available for integration/testing; see the TypeScript types and module exports in `src/index.ts`.

---

## Conformance Validation

This implementation is validated against canonical test vectors:
- [TEST_VECTORS](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/test_vectors/README.md)

---

## Functional Validation (Run Tests)

```bash
npm ci
npm test
npm run test:coverage
npm run lint
npm run typecheck
```

See [`TESTING.md`](./TESTING.md) for details.

---

## Validator (Dev Tool Only)

This repo includes a browser-based validator under `validator/` for development/testing/auditing workflows. It is **not** a wallet tool and must not be used with real funds.

See [`validator/README`](./validator/README.md) for features, required validation steps, and usage.

---

## Compatibility

- **Spec version**: v0.4.0
- **Node.js**: 18+

---

## Contributing

See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md).

---

## License

[MIT License](LICENSE)


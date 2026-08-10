# DuraShare (JS/TS)

[![Security: Unaudited](https://img.shields.io/badge/Security-Unaudited-orange)](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md)
[![CI](https://github.com/GRIFORTIS/durashare-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/GRIFORTIS/durashare-js/actions/workflows/ci.yml)
[![CodeQL](https://github.com/GRIFORTIS/durashare-js/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/GRIFORTIS/durashare-js/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/GRIFORTIS/durashare-js/graph/badge.svg)](https://codecov.io/gh/GRIFORTIS/durashare-js)
[![npm version](https://img.shields.io/npm/v/@grifortis/schiavinato-sharing.svg)](https://www.npmjs.com/package/@grifortis/schiavinato-sharing)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## DuraShare

**DuraShare: BIP39-Native Threshold Backup over GF(2053) with Full Manual Fallback and Per-Share Audit**

DuraShare uses Shamir secret sharing to split a **standard BIP39** recovery phrase into **k-of-n** durable, human-readable shares in an offline, software-assisted experience, **while keeping all the math executable manually on paper**. It also allows **individual geographically distributed shares to be verified** before recovery, without gathering a threshold or revealing the secret.

DuraShare **modifies existing, well-established cryptographic techniques** for human-friendly threshold backup. Reference implementations are thoroughly tested, published in good faith **as is**, and have **not** been independently audited. See [Disclaimer](#disclaimer).

## What is this?

JavaScript/TypeScript library for DuraShare (browser global: `DuraShare`). Split and recover BIP39 mnemonics with integrity checks against the canonical arithmetic share-table subset.

> **Note:** This JS/TS library is not yet full protocol v0.7.0.

## Links

- **Canonical specification**: [durashare](https://github.com/GRIFORTIS/durashare)
  - Standing review guide: [docs/review](https://github.com/GRIFORTIS/durashare/blob/main/docs/review.md)
- **Whitepaper**: [PDF (latest)](https://github.com/GRIFORTIS/durashare/releases/latest/download/WHITEPAPER.pdf) | [Releases](https://github.com/GRIFORTIS/durashare/releases) | [LaTeX](https://github.com/GRIFORTIS/durashare/blob/main/whitepaper/WHITEPAPER.tex)
- **Test vectors**: [TEST_VECTORS](https://github.com/GRIFORTIS/durashare/blob/main/test_vectors/README.md)
- **Related implementations**:
  - HTML (single-file, air-gapped): [durashare-html](https://github.com/GRIFORTIS/durashare-html)
  - Python: [durashare-py](https://github.com/GRIFORTIS/durashare-py)
- **Validator (dev tool)**: [`validator/README`](./validator/README.md)
- **Security**: [SECURITY](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md)

### Install

```bash
npm install @grifortis/schiavinato-sharing
```

Published package name: `@grifortis/schiavinato-sharing`.

### Quick start

```ts
import { recoverAndValidate, splitBip39 } from '@grifortis/schiavinato-sharing';

const { shares } = await splitBip39(mnemonic, 2, 3);
const result = await recoverAndValidate([shares[0], shares[1]], 12);
if (!result.success) throw new Error(String(result.errors.generic ?? 'Recovery failed'));
console.log(result.recoveredMnemonic);
```

Entry points: `splitBip39`, `recoverAndValidate`, `validateBIP39Mnemonic` / `validateBip39Mnemonic`, plus field/checksum helpers. See `src/index.ts`.

### Verify release artifacts

```bash
curl -fsSL https://raw.githubusercontent.com/GRIFORTIS/durashare-js/main/GRIFORTIS-PGP-PUBLIC-KEY.asc | gpg --import
gpg --fingerprint security@grifortis.com
# Expected: 7921 FD56 9450 8DA4 020E  671F 4CFE 6248 C57F 15DF
gpg --verify CHECKSUMS-LIBRARY.txt.asc CHECKSUMS-LIBRARY.txt
gpg --verify durashare-vX.Y.Z.tar.gz.asc durashare-vX.Y.Z.tar.gz
```

### Tests

```bash
npm ci && npm test && npm run typecheck
```

See [`TESTING`](./TESTING.md).

### Validator (dev tool only)

Browser-based validator under `validator/` for development/testing/auditing. **Not** a wallet tool — do not use with real funds.

See [`validator/README`](./validator/README.md).

### Requirements

- Node.js 18+

---

## Contributing

See [CONTRIBUTING](https://github.com/GRIFORTIS/.github/blob/main/CONTRIBUTING.md).

## People

### Renato Schiavinato Lopez — Founder & Protocol Author
- Creator of DuraShare.
- [LinkedIn](https://www.linkedin.com/in/renato-agile-coach/) · [GitHub](https://github.com/renatoslopes)

### Jeroen van de Graaf — Chief Scientist; Advisory Board
- Professor, DCC–UFMG. Cryptographer (ZK, MPC, privacy, applied protocols); PhD, Université de Montréal (1997).
- [DCC/UFMG](https://dcc.ufmg.br/professor/jeroen-van-de-graaf/) · [DBLP](https://dblp.org/pid/27/6925.html) · [Lattes](http://lattes.cnpq.br/0069989873499216) · [Google Scholar](https://scholar.google.com.br/citations?user=-w8olWwAAAAJ)

## License

[MIT License](LICENSE)

## Disclaimer

Software has been thoroughly tested and is not known to contain errors. It is made available in good faith, as is, so use at your own risk. The author does not assume any responsibility for any damage, financial or other, that may result from using this software. Reference implementations have not been independently audited. **Do not use with real funds.** See [SECURITY](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md).

---

**Maintained by**: [GRIFORTIS](https://github.com/GRIFORTIS)

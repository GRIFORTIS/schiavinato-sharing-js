# DuraShare (JS/TS)

[![Security: Unaudited](https://img.shields.io/badge/Security-Unaudited-orange)](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md)
[![CI](https://github.com/GRIFORTIS/durashare-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/GRIFORTIS/durashare-js/actions/workflows/ci.yml)
[![CodeQL](https://github.com/GRIFORTIS/durashare-js/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/GRIFORTIS/durashare-js/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/GRIFORTIS/durashare-js/graph/badge.svg)](https://codecov.io/gh/GRIFORTIS/durashare-js)
[![npm version](https://img.shields.io/npm/v/@grifortis/schiavinato-sharing.svg)](https://www.npmjs.com/package/@grifortis/schiavinato-sharing)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

DuraShare **modifies existing, well-established cryptographic techniques** for human-friendly threshold backup. This library is thoroughly tested, published in good faith **as is**, and has **not** been independently audited. **Do not use with real funds.** See [Disclaimer](#disclaimer).

## DuraShare

**DuraShare: BIP39-Native Threshold Backup over GF(2053) with Full Manual Fallback and Per-Share Audit**

DuraShare lets you split a standard **BIP39** recovery phrase into **k-of-n** durable, human-readable backup shares, with optional **per-share audit** before recovery. The normal experience is **offline, software-assisted sharing and recovery**; the same core math can also be executed fully manually when software is unavailable or untrusted.

Canonical source of truth: **[GRIFORTIS/durashare](https://github.com/GRIFORTIS/durashare)** (whitepaper, manual/software specs, test vectors, security model).

> **Note:** This JS/TS library is not yet full protocol v0.7.0.

---

## This repository

JavaScript/TypeScript library for DuraShare. Browser global: `DuraShare`.

### Links

- **Spec / whitepaper**: [durashare](https://github.com/GRIFORTIS/durashare)
- **HTML tool**: [durashare-html](https://github.com/GRIFORTIS/durashare-html)
- **Python**: [durashare-py](https://github.com/GRIFORTIS/durashare-py)
- **Security**: [SECURITY](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md)
- **Validator (dev tool)**: [`validator/README`](./validator/README.md)

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

## License

[MIT License](LICENSE)

## Disclaimer

This software has been thoroughly tested and is not known to contain errors. It is made available in good faith, as is, so use at your own risk. The author does not assume any responsibility for any damage, financial or other, that may result from using this software. It has not been independently audited. **Do not use with real funds.** See [SECURITY](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md).

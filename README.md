# @grifortis/schiavinato-sharing-js

**Production-ready JavaScript/TypeScript library for Schiavinato Sharing**

Human-executable secret sharing for BIP39 mnemonics using GF(2053).

[![CI](https://github.com/GRIFORTIS/schiavinato-sharing-js/workflows/CI/badge.svg)](https://github.com/GRIFORTIS/schiavinato-sharing-js/actions)
[![codecov](https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js/graph/badge.svg?token=3b59c6f6-fd7f-404e-b678-c688b652809f)](https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js)
[![npm version](https://img.shields.io/npm/v/@grifortis/schiavinato-sharing.svg)](https://www.npmjs.com/package/@grifortis/schiavinato-sharing)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

---

## 📦 Installation

```bash
npm install @grifortis/schiavinato-sharing
```

```bash
yarn add @grifortis/schiavinato-sharing
```

```bash
pnpm add @grifortis/schiavinato-sharing
```

---

## 🚀 Quick Start

### Splitting a Mnemonic

```typescript
import { splitMnemonic } from '@grifortis/schiavinato-sharing';

const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const threshold = 2;  // Minimum shares needed to recover
const totalShares = 3; // Total shares to create

const shares = splitMnemonic(mnemonic, threshold, totalShares);
console.log(shares);
// [
//   'share 1 of 3: word1 word2 ... wordN [checksum]',
//   'share 2 of 3: word1 word2 ... wordN [checksum]',
//   'share 3 of 3: word1 word2 ... wordN [checksum]'
// ]
```

### Recovering a Mnemonic

```typescript
import { recoverMnemonic } from '@grifortis/schiavinato-sharing';

const shares = [
  'share 1 of 3: word1 word2 ... wordN [checksum]',
  'share 2 of 3: word1 word2 ... wordN [checksum]'
];

const recovered = recoverMnemonic(shares);
console.log(recovered);
// 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
```

---

## 📚 API Reference

### `splitMnemonic(mnemonic, threshold, totalShares, options?)`

Splits a BIP39 mnemonic into shares using Schiavinato Sharing.

**Parameters:**
- `mnemonic` (string): Valid BIP39 mnemonic phrase (12, 15, 18, 21, or 24 words)
- `threshold` (number): Minimum shares needed for recovery (k)
- `totalShares` (number): Total shares to generate (n), where k ≤ n ≤ 16
- `options` (object, optional):
  - `language` (string): BIP39 wordlist language (default: 'english')
  - `includeChecksum` (boolean): Include checksums in shares (default: true)

**Returns:** `string[]` - Array of share strings

**Throws:**
- `ValidationError` - Invalid mnemonic, threshold, or totalShares
- `SecurityError` - Insufficient entropy or RNG failure

**Example:**
```typescript
const shares = splitMnemonic(
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  3, // threshold
  5, // total shares
  { includeChecksum: true }
);
```

---

### `recoverMnemonic(shares, options?)`

Recovers a BIP39 mnemonic from shares.

**Parameters:**
- `shares` (string[]): Array of share strings (at least k shares)
- `options` (object, optional):
  - `validateChecksum` (boolean): Verify share checksums (default: true)
  - `language` (string): BIP39 wordlist language (default: 'english')

**Returns:** `string` - Recovered BIP39 mnemonic

**Throws:**
- `ValidationError` - Invalid shares or insufficient shares
- `ChecksumError` - Share checksum verification failed
- `RecoveryError` - Polynomial reconstruction failed

**Example:**
```typescript
const recovered = recoverMnemonic(
  [
    'share 1 of 5: ...',
    'share 3 of 5: ...',
    'share 5 of 5: ...'
  ],
  { validateChecksum: true }
);
```

---

## 🎯 Features

- ✅ **Full TypeScript support** with comprehensive type definitions
- ✅ **Zero dependencies** (except for BIP39 and crypto utilities)
- ✅ **Node.js and browser support** (CommonJS + ESM + IIFE)
- ✅ **Built-in validation** for mnemonics and shares
- ✅ **Checksum verification** to detect errors
- ✅ **Constant-time operations** where applicable
- ✅ **Extensive test suite** (100% code coverage)
- ✅ **Production-ready** with semantic versioning

---

## 🔒 Security

### Security Status: ⚠️ EXPERIMENTAL

While this library implements well-established cryptographic principles, it has **NOT** been professionally audited.

**DO NOT USE FOR REAL FUNDS** until:
- [ ] Professional security audit completed
- [ ] Extensive peer review conducted
- [ ] v1.0.0 released

For now, use only for:
- ✅ Testing and development
- ✅ Educational purposes
- ✅ Research and experimentation

### Security Best Practices

When using this library:

1. **Use secure RNG**: Ensure your environment has a cryptographically secure random number generator
2. **Validate inputs**: Always validate user-provided mnemonics and shares
3. **Handle shares carefully**: Each share is sensitive; protect them
4. **Test recovery**: Always verify you can recover before relying on shares
5. **Use checksums**: Enable checksum verification (default)
6. **Offline use**: Perform sensitive operations on air-gapped machines

### Reporting Security Issues

See our [Security Policy](.github/SECURITY.md) for reporting vulnerabilities.

---

## 📖 Documentation

### Specification

This library implements the Schiavinato Sharing specification:

🔗 **[Specification Repository](https://github.com/GRIFORTIS/schiavinato-sharing-spec)**

Key documents:
- [Whitepaper](https://github.com/GRIFORTIS/schiavinato-sharing-spec/blob/main/WHITEPAPER.md) – Complete mathematical description
- [Test Vectors](https://github.com/GRIFORTIS/schiavinato-sharing-spec/blob/main/TEST_VECTORS.md) – Validation data
- [Reference Implementation](https://github.com/GRIFORTIS/schiavinato-sharing-spec/tree/main/reference-implementation) – HTML tool

### How It Works

Schiavinato Sharing is a secret-sharing scheme for BIP39 mnemonics:

1. **Conversion**: Mnemonic words → numbers in GF(2053)
2. **Polynomial**: Create polynomial of degree k-1 with secret as constant term
3. **Evaluation**: Evaluate polynomial at n different points to generate shares
4. **Recovery**: Use Lagrange interpolation to reconstruct the polynomial
5. **Checksums**: Add error-detection checksums to each share

See the [whitepaper](https://github.com/GRIFORTIS/schiavinato-sharing-spec/blob/main/WHITEPAPER.md) for mathematical details.

---

## 🧪 Testing

This library includes extensive tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Type checking
npm run typecheck

# Lint
npm run lint
```

### Test Coverage

- Unit tests for all functions
- Integration tests for full workflows
- Edge case and error handling tests
- Cross-validation with test vectors
- Browser compatibility tests

---

## 🏗️ Building

```bash
# Build all formats (CJS, ESM, types)
npm run build

# Build browser bundle
npm run build:browser
```

Output:
- `dist/index.js` – CommonJS
- `dist/index.mjs` – ES Modules
- `dist/index.d.ts` – TypeScript definitions
- `dist/browser/` – IIFE browser bundle

---

## 📦 Package Exports

This package provides multiple formats:

```json
{
  "main": "./dist/index.js",       // CommonJS
  "module": "./dist/index.mjs",    // ES Module
  "types": "./dist/index.d.ts",    // TypeScript
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "require": "./dist/index.js",
      "import": "./dist/index.mjs"
    }
  }
}
```

### Node.js (CommonJS)

```javascript
const { splitMnemonic, recoverMnemonic } = require('@grifortis/schiavinato-sharing');
```

### Node.js (ESM)

```javascript
import { splitMnemonic, recoverMnemonic } from '@grifortis/schiavinato-sharing';
```

### Browser (via CDN)

```html
<script src="https://unpkg.com/@grifortis/schiavinato-sharing"></script>
<script>
  const { splitMnemonic, recoverMnemonic } = SchiavinatoSharing;
</script>
```

---

## 🔧 Advanced Usage

### Custom Options

```typescript
import { splitMnemonic, recoverMnemonic } from '@grifortis/schiavinato-sharing';

// Split with custom options
const shares = splitMnemonic(mnemonic, 2, 3, {
  language: 'english',      // BIP39 language
  includeChecksum: true     // Include checksums (recommended)
});

// Recover with validation
const recovered = recoverMnemonic(shares, {
  validateChecksum: true,   // Verify checksums (recommended)
  language: 'english'
});
```

### Error Handling

```typescript
import { 
  splitMnemonic, 
  ValidationError, 
  ChecksumError 
} from '@grifortis/schiavinato-sharing';

try {
  const shares = splitMnemonic(mnemonic, 2, 3);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}

try {
  const recovered = recoverMnemonic(shares);
} catch (error) {
  if (error instanceof ChecksumError) {
    console.error('Share corrupted:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Invalid shares:', error.message);
  }
}
```

---

## 🌍 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Requirements:**
- WebCrypto API for secure random number generation
- ES2020 support

---

## 🤝 Contributing

Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md).

Areas we'd love help with:
- 🐛 Bug reports and fixes
- 🧪 Additional test cases
- 📖 Documentation improvements
- 🌍 Internationalization
- ⚡ Performance optimizations

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## 📄 License

[MIT License](LICENSE) – see file for details.

---

## 🔗 Related Projects

- **[Specification](https://github.com/GRIFORTIS/schiavinato-sharing-spec)** – Whitepaper and reference implementation
- **[Python Library](https://github.com/GRIFORTIS/schiavinato-sharing-py)** – Python implementation (coming soon)
- **[GRIFORTIS](https://github.com/GRIFORTIS)** – Organization homepage

---

## 🙏 Acknowledgments

This implementation is based on:
- Shamir, A. (1979). "How to Share a Secret"
- BIP39: Mnemonic code for generating deterministic keys
- The Schiavinato Sharing specification by Renato Schiavinato Lopez

---

## ❓ Support

- 📖 **Documentation**: See [specification repo](https://github.com/GRIFORTIS/schiavinato-sharing-spec)
- 🐛 **Bug Reports**: [Open an issue](https://github.com/GRIFORTIS/schiavinato-sharing-js/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/GRIFORTIS/schiavinato-sharing-js/discussions)
- 📧 **Email**: support@grifortis.com

---

**Made with ❤️ by [GRIFORTIS](https://github.com/GRIFORTIS)**

*Empowering digital sovereignty through open-source tools.*


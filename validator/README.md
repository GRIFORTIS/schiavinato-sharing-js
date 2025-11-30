# Schiavinato Sharing Validator

[![npm version](https://img.shields.io/npm/v/@grifortis/schiavinato-validator.svg)](https://www.npmjs.com/package/@grifortis/schiavinato-validator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Interactive browser-based validator and testing tool for Schiavinato Sharing**

A professional-grade, transparent validation interface for the Schiavinato Sharing cryptographic scheme. This tool serves as the core GRIFORTIS asset for testing, auditing, and demonstrating human-executable secret sharing for BIP39 mnemonics.

## Overview

The Schiavinato Sharing Validator is a comprehensive, single-file HTML application that provides a visual, interactive environment for testing the Schiavinato Sharing library. It's designed for developers, auditors, educators, and security researchers who need a transparent, audit-friendly interface to validate cryptographic operations.

**Core Value Propositions:**
- 🔍 **Full Transparency**: Complete source code visible and auditable
- 🎯 **Zero Installation**: Works in any modern browser
- 🛡️ **Air-Gapped Capable**: Operates offline with cached dependencies
- 📊 **Visual Interface**: Interactive testing with immediate feedback
- 🔬 **Professional Quality**: Used across all GRIFORTIS product tiers

## Installation & Access

### NPM Package

```bash
npm install @grifortis/schiavinato-validator
```

After installation, the HTML file is located at:
```
node_modules/@grifortis/schiavinato-validator/JS_Library_Validator.html
```

Open this file in a browser using a local server (required for ES modules).

### Direct Download

Download the standalone HTML file from [GitHub Releases](https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/latest):

- `schiavinato-validator-v{version}.html`
- `schiavinato-validator-v{version}.html.sha256` (checksum for verification)

### From Source Repository

If you've cloned the [schiavinato-sharing-js](https://github.com/GRIFORTIS/schiavinato-sharing-js) repository:

```bash
cd schiavinato-sharing-js
npm run validator
# Opens at http://localhost:8080/validator/JS_Library_Validator.html
```

### Features

- **BIP39 Seed Generation**: Generate valid 12 or 24-word BIP39 mnemonics
- **Multiple Input Formats**: Support for both word lists and numeric indices
- **Share Creation**: Split mnemonics into Shamir shares using configurable K-of-N schemes
- **Wallet Recovery**: Reconstruct mnemonics from any K shares
- **BIP39 Validation**: Verify checksum integrity of recovered wallets
- **Audit Tools**: Intentionally break BIP39 checksums for testing error handling
- **Visual Feedback**: Color-coded share selection and validation status

## Usage

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (required for ES modules)
- Built library (run `npm run build` first)

### Running the Validator

1. **Using npm script** (recommended):
   ```bash
   npm run validator
   ```

2. **Manual server setup**:
   ```bash
   # Using Python
   python3 -m http.server 8080
   
   # Using Node.js
   npx serve -p 8080 .
   
   # Using PHP
   php -S localhost:8080
   ```

3. **Open in browser**:
   ```
   http://localhost:8080/validator/JS_Library_Validator.html
   ```

### Testing Workflow

1. **Configure**: Set threshold (K) and total shares (N)
2. **Create Seed**: Generate or enter a BIP39 mnemonic
3. **Generate Shares**: Split the seed into Shamir shares
4. **Select Shares**: Choose which K shares to use for recovery
5. **Recover**: Reconstruct the original mnemonic
6. **Validate**: Verify BIP39 checksum integrity

### Audit Features

The validator includes a "Break BIP39" button on Share 1 that intentionally corrupts the checksum. This tests:
- Error detection in the recovery process
- BIP39 validation warnings
- Integrity verification mechanisms

## Security Warnings

⚠️ **TESTING TOOL ONLY - NOT FOR PRODUCTION USE**

- **Do NOT** use this tool with real cryptocurrency wallets
- **Do NOT** use generated seeds for actual funds
- **Do NOT** use in air-gapped environments for real assets
- This tool loads external dependencies via CDN
- Intended for development, testing, and auditing only

## Auditing & Security

The Schiavinato Sharing Validator is designed specifically for security auditing and cryptographic verification.

### Audit-Friendly Design

**Full Transparency:**
- Single HTML file with embedded CSS and JavaScript
- All cryptographic operations visible in source code
- No minification or obfuscation
- CDN dependencies clearly declared in import maps
- Complete version synchronization with main library

**Verification Features:**
- Checksum validation for all share operations
- BIP39 mnemonic validation
- Visual feedback for errors and warnings
- Intentional corruption tools for testing error handling

### Security Auditing Tools

The validator includes an **"Break BIP39"** feature that intentionally corrupts checksums on Share 1. This auditing tool enables testing of:
- Error detection mechanisms
- Checksum validation logic
- Recovery process resilience
- Warning system effectiveness

**Audit Workflow:**
1. Generate valid shares from a test mnemonic
2. Use "Break BIP39" to corrupt Share 1
3. Attempt recovery with corrupted share
4. Verify that validation errors are properly detected and reported
5. Confirm that the system prevents use of invalid data

### Relationship to Test Vectors

This validator complements the automated test suite and TEST_VECTORS.md:

| Component | Purpose |
|-----------|---------|
| **TEST_VECTORS.md** | Mathematical validation of share generation and recovery |
| **Automated Tests** | Programmatic verification of library functions |
| **Validator (this tool)** | Manual, visual testing with custom inputs |

**Use this tool to:**
- ✅ Verify test vector outputs visually
- ✅ Test edge cases interactively
- ✅ Audit library behavior with custom inputs
- ✅ Demonstrate the library to stakeholders
- ✅ Validate integration implementations
- ✅ Train users on proper usage

## Technical Details

### Architecture

- **Single-file HTML**: Self-contained for easy distribution
- **ES Modules**: Imports library via `dist/index.mjs`
- **Import Maps**: Loads dependencies from esm.sh CDN
- **No Build Step**: Works directly with browser-native modules

### Dependencies

Loaded via import maps:
- `@scure/bip39` - BIP39 mnemonic handling
- `@noble/hashes` - Cryptographic hash functions

### Library Integration

The validator imports the built library:

```javascript
const SS = await import('./dist/index.mjs');
```

Ensure you've built the library first:

```bash
npm run build
```

## Troubleshooting

### "Failed to load library" Error

- **Cause**: Library not built or server not running from correct directory
- **Solution**: Run `npm run build`, then start server from project root

### ES Module Import Errors

- **Cause**: Opening HTML file directly (file:// protocol)
- **Solution**: Use a local web server (see Usage section)

### "Library not loaded" Alerts

- **Cause**: Import failed or blocked by browser
- **Solution**: Check browser console for errors, ensure CORS is allowed

## Development

### Modifying the Validator

The validator is a single HTML file with embedded CSS and JavaScript. To modify:

1. Edit `validator/JS_Library_Validator.html`
2. Test changes locally
3. Commit to repository

### Adding Features

When adding features:
- Maintain single-file architecture
- Keep dependencies minimal
- Update this README
- Test thoroughly before committing

## Files

- `JS_Library_Validator.html` - Main validator application
- `README.md` - This file

## Contributing

We welcome contributions to improve the validator!

### How to Contribute

**Bug Reports:**
- Open an issue on [GitHub](https://github.com/GRIFORTIS/schiavinato-sharing-js/issues)
- Include browser version and steps to reproduce
- Attach screenshots if helpful

**Feature Requests:**
- Describe the use case and expected behavior
- Explain how it improves testing or auditing capabilities

**Code Contributions:**
- The validator is a single HTML file for portability
- Maintain audit-friendly code (no minification)
- Test in multiple browsers before submitting
- Update documentation as needed

**Guidelines:**
- Follow existing code style
- Add comments for complex logic
- Keep the single-file architecture
- Test offline functionality

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for general contribution guidelines.

---

## Related Projects

**GRIFORTIS Ecosystem:**
- **[Main Library](../README.md)** – JavaScript/TypeScript implementation
- **[Specification](https://github.com/GRIFORTIS/schiavinato-sharing-spec)** – Whitepaper and protocol docs
- **[Python Library](https://github.com/GRIFORTIS/schiavinato-sharing-py)** – Python implementation
- **[GRIFORTIS](https://github.com/GRIFORTIS)** – Organization homepage

**Resources:**
- **[Whitepaper](https://github.com/GRIFORTIS/schiavinato-sharing-spec/blob/main/WHITEPAPER.md)** – Complete mathematical description
- **[Test Vectors](https://github.com/GRIFORTIS/schiavinato-sharing-spec/blob/main/TEST_VECTORS.md)** – Validation data
- **[RFC](https://github.com/GRIFORTIS/schiavinato-sharing-spec/blob/main/RFC.md)** – Protocol specification

---

## About GRIFORTIS

GRIFORTIS is the trusted authority for cryptocurrency inheritance and backup solutions, combining academic rigor with practical tools that anyone can use.

**Mission:**  
Empowering digital sovereignty through open-source cryptographic excellence.

**Core Values:**
- 🔒 Security Above All
- 👥 Human-First Design
- 📖 Open Source Foundation
- 💼 Sustainable Profitability

**Learn More:**
- Website: [grifortis.com](https://grifortis.com)
- GitHub: [@GRIFORTIS](https://github.com/GRIFORTIS)
- Email: info@grifortis.com

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support

- 📖 **Documentation**: [Main README](../README.md)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/GRIFORTIS/schiavinato-sharing-js/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/GRIFORTIS/schiavinato-sharing-js/discussions)
- 📧 **Email**: support@grifortis.com

---

**Made with ❤️ by [GRIFORTIS](https://github.com/GRIFORTIS)**

*Part of the Schiavinato Sharing Project – Human-executable secret sharing for digital sovereignty.*


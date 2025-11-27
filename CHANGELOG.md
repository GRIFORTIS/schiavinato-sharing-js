# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - Unreleased

### Added
- `wipeString` utility function for attempting to clear sensitive strings from memory
  - Matches HTML reference implementation
  - Limited effectiveness due to JavaScript string immutability, but reduces vulnerability window

### Security
- All Schiavinato checksums (row and master) use constant-time comparison to prevent timing attacks
- Memory wiping functions (`secureWipeArray`, `secureWipeNumber`, `wipeString`) reduce memory exposure window
- **Note**: BIP39 checksum validation is delegated to `@scure/bip39`, which does NOT use constant-time comparison
  - This is a known limitation of the `@scure/base` library's checksum implementation
  - The vulnerability is minimal in practice but theoretically allows timing attacks on BIP39 validation
  - Consider implementing custom BIP39 validation with constant-time comparison for highest security applications

## [0.1.0] - 2025-11-23

### Added
- Initial release of Schiavinato Sharing JavaScript/TypeScript library
- Core GF(2053) field arithmetic operations
- Polynomial creation and evaluation
- Lagrange interpolation for secret reconstruction
- BIP39 mnemonic splitting with configurable k-of-n threshold
- BIP39 mnemonic recovery with comprehensive validation
- Row and master checksum computation and verification
- TypeScript type definitions for all public APIs
- Comprehensive test suite with 100% coverage
- Integration tests using canonical test vectors from TEST_VECTORS.md
- Support for both 12-word and 24-word mnemonics
- Browser and Node.js compatibility
- ESM, CommonJS, and UMD module formats
- Extensive documentation and examples

### Security
- Uses `@scure/bip39` for BIP39 validation (audited library)
- Uses `@noble/hashes` for SHA-256 (audited library)
- Cryptographically secure random number generation via Web Crypto API / Node.js crypto
- Rejection sampling to avoid modulo bias in random number generation

### Documentation
- Comprehensive README with API reference
- JSDoc comments on all public functions
- Security considerations and best practices
- Examples for common use cases
- Migration guide from HTML tool


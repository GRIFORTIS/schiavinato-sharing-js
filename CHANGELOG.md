# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-12-06

### Changed
- Checksum shares are now computed deterministically as the sum of word shares (mod 2053) rather than using independent random polynomials
- This change enables share integrity validation during the splitting process
- Recovery algorithm unchanged - all existing shares remain recoverable
- Maintains all LSSS security properties

### Benefits
- Users can verify share integrity during manual splitting
- Row checksum share = sum of 3 word shares in that row (mod 2053)
- Global checksum share = sum of all word shares (mod 2053)
- Catches arithmetic errors before share distribution
- Zero impact on recovery time or process

### Security Note
- No information leakage (checksums are deterministic functions of words)
- Threshold property preserved (still requires k shares for recovery)
- Entropy source unchanged (word polynomials remain random)

### Migration
- No API changes required
- Shares created with v0.2.0 remain recoverable by v0.3.0
- Shares created with v0.3.0 remain recoverable by v0.2.0
- The only difference is checksum computation method during split

## [0.2.0] - 2025-11-30

### Changed
- **BREAKING**: Renamed "master" terminology to "global checksum" throughout the library
  - `computeMasterCheck()` → `computeGlobalChecksum()`
  - `masterVerificationShare` → `globalChecksumVerificationShare`
  - `errors.master` → `errors.global`
  - This change improves clarity and better describes the checksum's purpose

### Added
- `wipeString` utility function for attempting to clear sensitive strings from memory
  - Matches HTML reference implementation
  - Limited effectiveness due to JavaScript string immutability, but reduces vulnerability window

### Security
- All Schiavinato checksums (row and global) use constant-time comparison to prevent timing attacks
- Memory wiping functions (`secureWipeArray`, `secureWipeNumber`, `wipeString`) reduce memory exposure window
- **Note**: BIP39 checksum validation is delegated to `@scure/bip39`, which does NOT use constant-time comparison
  - This is a known limitation of the `@scure/base` library's checksum implementation
  - The vulnerability is minimal in practice but theoretically allows timing attacks on BIP39 validation
  - Consider implementing custom BIP39 validation with constant-time comparison for highest security applications

### Migration Guide (v0.1.x → v0.2.0)
If you're using the library programmatically, update your code:

```typescript
// Before (v0.1.x)
import { computeMasterCheck } from '@grifortis/schiavinato-sharing';
const share = { masterVerificationShare: 123, ... };
if (result.errors.master) { ... }

// After (v0.2.0)
import { computeGlobalChecksum } from '@grifortis/schiavinato-sharing';
const share = { globalChecksumVerificationShare: 123, ... };
if (result.errors.global) { ... }
```

## [0.1.0] - 2025-11-23

### Added
- Initial release of Schiavinato Sharing JavaScript/TypeScript library
- Core GF(2053) field arithmetic operations
- Polynomial creation and evaluation
- Lagrange interpolation for secret reconstruction
- BIP39 mnemonic splitting with configurable k-of-n threshold
- BIP39 mnemonic recovery with comprehensive validation
- Row and global checksum computation and verification
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


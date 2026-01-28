# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-01-28

### Added - Core Features
- **Native 1-based BIP39 implementation** - Removed @scure/bip39 dependency
  - All BIP39 operations now use native GRIFORTIS implementation
  - BIP39 wordlist embedded in library (2048 words from specification)
  - O(1) word-to-ID and ID-to-word lookups (faster than array scanning)
  - Eliminated all +1/-1 conversion operations throughout codebase
- **BIP39 indexing is now 1-based (1-2048) throughout entire architecture**
  - "abandon" = ID 1, "zoo" = ID 2048, "spin" = ID 1680 (native, not converted)
  - Aligns with human-centric design and manual calculation requirements
  - Eliminates off-by-one bugs from conversions
- Native BIP39 module (`src/bip39/`):
  - `BIP39_WORDLIST` - Embedded 2048-word English wordlist
  - `wordToBip39Id()` - O(1) word to 1-based ID conversion
  - `bip39IdToWord()` - O(1) ID to word conversion  
  - `isBip39Id()` - Check if value is valid BIP39 ID (1-2048)
  - `isValidShareId()` - Check if value is valid share ID (0, 1-2048, 2049-2052)
  - `validateBip39Mnemonic()` - Native checksum validation
  - `generateBip39Mnemonic()` - Native mnemonic generation
- Support for GF(2053) edge cases in ID-to-word conversion:
  - ID 0 → `[0-out-of-range]`, IDs 2049-2052 → `[NNNN-out-of-range]`
- **Dual-path checksum validation** to detect bit flips and hardware faults
  - Path A: Direct computation (sum of word shares mod 2053)
  - Path B: Polynomial-based (sum polynomial coefficients, then evaluate)
  - Both paths must agree, providing redundant validation
- New polynomial checksum functions in public API:
  - `sumPolynomials()` - Sum polynomial coefficients modulo 2053
  - `computeRowCheckPolynomials()` - Create row checksum polynomials
  - `computeGlobalIntegrityCheckPolynomial()` - Create GIC polynomial
- Enhanced error reporting in `RecoveryResult`:
  - `errors.rowPathMismatch` - Array of row indices where paths disagree
  - `errors.globalPathMismatch` - Boolean indicating global checksum path disagreement

### Changed - API
- **API simplification** (removing unused wordlist parameters):
  - `validateBip39Mnemonic(mnemonic)` - removed wordlist parameter (English only)
  - `mnemonicToIndices(mnemonic)` - removed wordlist parameter
  - `indicesToMnemonic(indices)` - removed wordlist parameter
  - `parseInput(input)` - removed wordlist parameter
- **Terminology standardization**: "Global Checksum" → "Global Integrity Check (GIC)"
  - Property: `globalChecksumVerificationShare` → `globalIntegrityCheckShare`
  - Function: `computeGlobalChecksum()` → `computeGlobalIntegrityCheck()`
  - Function: `computeGlobalCheckPolynomial()` → `computeGlobalIntegrityCheckPolynomial()`
- `splitMnemonic()` validates both checksum paths during generation
- `recoverMnemonic()` validates both checksum paths during recovery

### Security - Enhancements
- **GPG signing added** - All releases now GPG-signed for maximum security
  - CHECKSUMS.txt and CHECKSUMS.json GPG-signed
  - Release tarballs GPG-signed
  - Validator HTML GPG-signed
  - GRIFORTIS PGP public key included in repository
  - Verification instructions in README and SECURITY.md
- **CodeQL security analysis** added to CI pipeline
- **Gitleaks secret scanning** enhanced with license key
- Improved fault detection: Dual-path validation catches bit flips and memory corruption
- Reduced attack surface: One less external dependency (@scure/bip39 removed)
- Native BIP39 validation using @noble/hashes (already a dependency)
- All checksum comparisons use constant-time equality (timing attack prevention)

### Fixed
- Eliminated off-by-one conversion bugs throughout codebase
- Cross-implementation compatibility: JS shares recoverable by Python implementation
- Manual recovery calculations now match computerized results
- TEST_VECTORS.md validation passes completely
- Polynomial construction uses correct 1-based secrets
- Linting: Removed unused variable warnings

### Performance
- O(1) map lookups vs O(n) array scanning for BIP39 operations
- Smaller bundle: ~50KB reduction from removing @scure/bip39
- Faster BIP39 validation and conversion

### Documentation
- Whitepaper publication alignment across all docs
- GPG verification instructions in README and SECURITY.md
- Validator security warnings enhanced (dev tool only, not for production)
- Validator README corrected (removed false air-gap claim)
- Comprehensive test suite for dual-path checksums and BIP39 operations
- Enhanced JSDoc comments throughout

### Testing
- Added comprehensive test coverage for 1-based indexing
- Added test vectors for exact cross-implementation validation
- Added fault injection tests
- Added platform fallback tests
- Enhanced timing tests with tighter bounds

## [0.3.0] - 2025-12-06

### Added
- **Dual-path checksum validation** to detect bit flips and hardware faults during share generation and recovery
  - Path A: Direct computation (sum of word shares mod 2053)
  - Path B: Polynomial-based (sum polynomial coefficients, then evaluate)
  - Both paths must agree, providing redundant validation
- New polynomial checksum functions exported in public API:
  - `sumPolynomials()` - Sum polynomial coefficients modulo 2053
  - `computeRowCheckPolynomials()` - Create row checksum polynomials
  - `computeGlobalCheckPolynomial()` - Create global checksum polynomial
- Enhanced error reporting in `RecoveryResult`:
  - `errors.rowPathMismatch` - Array of row indices where Path A and Path B disagree
  - `errors.globalPathMismatch` - Boolean indicating global checksum path disagreement

### Changed
- `splitMnemonic()` now validates both checksum paths during share generation
  - Throws descriptive error if paths disagree (indicates hardware fault)
  - Error messages specify which share and checksum failed validation
- `recoverMnemonic()` now validates both checksum paths during recovery
  - Compares interpolated checksums (Path B) against recomputed checksums (Path A)
  - Success requires both path agreement AND existing checksum validations

### Security
- Improved fault detection: dual-path validation catches bit flips, memory corruption, and hardware faults that single-path validation might miss
- Polynomial-based validation provides mathematical redundancy independent of direct computation
- All checksum comparisons continue to use constant-time equality to prevent timing attacks

### Documentation
- Updated README with Path A/B explanation
- Added comprehensive test suite for polynomial checksum validation
- Enhanced JSDoc comments with Path A/B details throughout codebase

### Backward Compatibility
- No breaking API changes
- Shares created with v0.3.0 remain fully compatible and recoverable
- New error fields (`rowPathMismatch`, `globalPathMismatch`) are optional additions
- All existing code continues to work without modification

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


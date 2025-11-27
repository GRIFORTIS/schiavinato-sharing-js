# Security Analysis: Timing Attack Prevention

## Summary

This document analyzes the timing attack prevention measures in the Schiavinato Sharing JS library and compares them with the HTML reference implementation.

## Findings

### ✅ Fully Implemented Security Features

1. **Constant-Time Comparison for Schiavinato Checksums**
   - Location: `src/utils/security.ts`
   - Function: `constantTimeEqual()`
   - Used in: Row checksum validation and master checksum validation in `src/schiavinato/recover.ts`
   - Status: ✅ **Fully implemented and tested**
   - Prevents timing attacks on Schiavinato-specific checksums

2. **Memory Wiping Utilities**
   - Functions: `secureWipeArray()`, `secureWipeNumber()`, `wipeString()`
   - Location: `src/utils/security.ts`
   - Used in: `finally` blocks in both `split.ts` and `recover.ts`
   - Status: ✅ **Fully implemented and tested**
   - Reduces window of vulnerability to memory dump attacks

3. **Constant-Time String Comparison**
   - Function: `constantTimeStringEqual()`
   - Location: `src/utils/security.ts`
   - Status: ✅ **Implemented** (available but not actively used for BIP39)
   - Can be used for custom BIP39 validation if needed

### ⚠️ Known Limitation: BIP39 Checksum Validation

**Issue**: The `@scure/bip39` library does NOT use constant-time comparison for BIP39 checksum validation.

**Evidence**: Analysis of `@scure/base` source code reveals:

```typescript
// From @scure/base/index.ts, lines 339-340
decode(data: Uint8Array) {
  // ... snip ...
  for (let i = 0; i < len; i++)
    if (newChecksum[i] !== oldChecksum[i]) throw new Error('Invalid checksum');
  // ...
}
```

This loop exits early on the first mismatch, creating a timing side-channel.

**Risk Assessment**:
- **Severity**: Low to Medium (theoretical vulnerability)
- **Exploitability**: Difficult in practice due to:
  - BIP39 checksum is computed from SHA-256, which is computationally expensive
  - Network latency typically dwarfs timing differences
  - Requires precise timing measurement over many iterations
- **Scope**: Only affects BIP39 checksum validation, NOT Schiavinato checksums

**Impact**:
- An attacker with the ability to measure precise timing of validation operations could theoretically determine:
  - Whether a mnemonic is closer to being valid
  - Potentially narrow down the search space for brute-force attacks

**Mitigation Options**:

1. **Accept the limitation** (RECOMMENDED for most applications)
   - `@scure/bip39` is professionally audited
   - Timing attack on BIP39 validation is difficult to exploit in practice
   - The library is widely used and maintained

2. **Implement custom BIP39 validation** (for highest security applications)
   - Use the HTML reference implementation's approach
   - Compute SHA-256 checksum manually
   - Use `constantTimeStringEqual()` for comparison
   - Trade-off: More code to maintain, less benefit from upstream updates

## Comparison with HTML Reference Implementation

| Feature | HTML Implementation | JS Library | Status |
|---------|-------------------|------------|--------|
| Constant-time checksum comparison | ✅ Yes | ✅ Yes | ✅ Match |
| Constant-time string comparison | ✅ Yes | ✅ Yes | ✅ Match |
| Memory wiping (arrays) | ✅ Yes | ✅ Yes | ✅ Match |
| Memory wiping (strings) | ✅ Yes | ✅ Yes | ✅ Match |
| Custom BIP39 validation | ✅ Yes (with constant-time) | ⚠️ Delegates to @scure/bip39 | ⚠️ Difference |

## Recommendations

1. **For Most Users**: 
   - Current implementation is secure and follows best practices
   - `@scure/bip39` is audited and widely trusted
   - Timing attack on BIP39 validation is theoretical and difficult to exploit

2. **For High-Security Applications**:
   - Consider implementing custom BIP39 validation with constant-time comparison
   - Follow the HTML reference implementation pattern
   - Document the trade-offs clearly

3. **Future Improvements**:
   - Consider submitting a PR to `@scure/base` to add constant-time comparison option
   - Monitor upstream for security updates
   - Consider making BIP39 validation pluggable (allow custom validators)

## Testing

All security functions have been thoroughly tested:
- Unit tests in `test/security.test.ts`
- Performance tests to verify constant-time behavior
- Integration tests to verify usage in recovery flow

## References

- HTML Reference Implementation: `schiavinato-sharing-spec/reference-implementation/schiavinato_sharing.html`
- @scure/bip39: https://github.com/paulmillr/scure-bip39
- @scure/base: https://github.com/paulmillr/scure-base

## Changelog

- 2025-11-27: Initial security analysis
- 2025-11-27: Added `wipeString` function to match HTML implementation
- 2025-11-27: Discovered and documented @scure/bip39 timing limitation


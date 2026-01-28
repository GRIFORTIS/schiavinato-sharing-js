# Security Policy

## Reporting Security Vulnerabilities

**DO NOT** open a public GitHub issue for security vulnerabilities.

Email: **security@grifortis.com**

Include: Description, steps to reproduce, potential impact, suggested fix (if any)

Response time: Within 48 hours

---

## v0.5.0 Security Improvements

**Native BIP39 Implementation:**
- Removed @scure/bip39 external dependency, reducing attack surface
- Native implementation using only @noble/hashes (already required for checksums)
- Embedded wordlist eliminates external wordlist loading risks
- O(1) lookups prevent timing-based word inference attacks
- Fewer dependencies = smaller audit scope = faster security review cycles

**1-Based Architecture:**
- Eliminated all +1/-1 conversion operations (source of systematic bugs)
- Mathematically correct: polynomials use actual BIP39 IDs (1680 for "spin", not 1679)
- Cross-implementation compatible: shares work with Python implementation
- Manual recovery calculations match computerized results exactly

---

## Package Integrity Verification

### SHA256 Checksums (Automatic)

Every release includes SHA256 checksums attached to GitHub releases.

**Quick verify:**
```bash
npm run verify:latest
```

**Manual verify:**
```bash
curl -fsSL https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/download/v0.1.0/CHECKSUMS.txt -o CHECKSUMS.txt
cd node_modules/@grifortis/schiavinato-sharing/dist
sha256sum -c ../../../CHECKSUMS.txt
```

**NPM Provenance:**
```bash
npm audit signatures
```

Verifies package was built by GitHub Actions from correct source.

### GPG Signatures (v0.5.1+)

All releases are signed with GRIFORTIS GPG key.

**Import public key:**
```bash
curl -fsSL https://raw.githubusercontent.com/GRIFORTIS/schiavinato-sharing-js/main/GRIFORTIS-PGP-PUBLIC-KEY.asc | gpg --import
```

Or download from this repository: [GRIFORTIS-PGP-PUBLIC-KEY.asc](GRIFORTIS-PGP-PUBLIC-KEY.asc)

**Verify release signatures:**
```bash
# Download release files
curl -fsSL https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/download/v0.5.1/CHECKSUMS.txt -o CHECKSUMS.txt
curl -fsSL https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/download/v0.5.1/CHECKSUMS.txt.asc -o CHECKSUMS.txt.asc

# Verify signature
gpg --verify CHECKSUMS.txt.asc CHECKSUMS.txt
```

**Expected output:**
```
gpg: Good signature from "GRIFORTIS <security@grifortis.com>"
Primary key fingerprint: 7921 FD56 9450 8DA4 020E  671F 4CFE 6248 C57F 15DF
```

**Key fingerprint:** `4C FE 62 48 C5 7F 15 DF`

---

## Security Features

### Constant-Time Operations

Prevents timing attacks on checksum validation:

**`constantTimeEqual(a, b)`** - Field element comparison
```typescript
const diff = a ^ b;  // XOR - constant time
return diff === 0;
```

**`constantTimeStringEqual(a, b)`** - String comparison
```typescript
const maxLen = Math.max(a.length, b.length);
let diff = a.length ^ b.length;
for (let i = 0; i < maxLen; i++) {
  const charA = i < a.length ? a.charCodeAt(i) : 0;
  const charB = i < b.length ? b.charCodeAt(i) : 0;
  diff |= charA ^ charB;  // No early exit
}
return diff === 0;
```

**Why constant-time:**
- No branching on secret values
- No early exits
- Fixed number of operations regardless of input
- Uses only bitwise operations (XOR, OR)

**Used in:**
- Row checksum validation (`recover.ts` line 143)
- Global Checksum validation (`recover.ts` line 151)

### Memory Wiping

Clears sensitive data from memory after use:

- `secureWipeArray(arr)` - Overwrites arrays with zeros
- `secureWipeNumber(n)` - Returns 0
- `wipeString(str)` - Returns null-filled string

**Used in:**
- `split.ts` finally block (lines 140-145)
- `recover.ts` finally block (lines 196-198)

**Note:** JavaScript strings are immutable, so `wipeString` has limited effectiveness but reduces vulnerability window.

### Known Limitation: BIP39 Validation

`@scure/bip39` does NOT use constant-time comparison for BIP39 checksums.

**Risk:** Low-Medium (theoretical, difficult to exploit)
- SHA-256 computation dominates timing
- Network latency masks timing differences
- Requires precise measurement over many iterations

**Scope:** Only affects BIP39 validation, NOT Schiavinato checksums

**Mitigation:** Accept limitation (library is audited and widely trusted) OR implement custom BIP39 validation with constant-time comparison

---

## Timing Tests (Why Skipped)

Two timing tests in `security.test.ts` are skipped because JavaScript timing is too variable in CI to reliably test constant-time behavior.

**The implementations ARE constant-time by design** (verified by code review), but empirical timing tests fail due to:
- JIT compiler optimizations
- Garbage collection pauses
- Shared CPU in CI
- Variable system load

**For security audits:** Use specialized tools (dudect, ctgrind) or manual code review, not JavaScript timing tests.

---

## Checksum File Formats

### CHECKSUMS.txt
```
# SHA256 Checksums for @grifortis/schiavinato-sharing
Version: v0.1.0
Generated: 2025-11-27 10:00:00 UTC

abc123... dist/index.js
def456... dist/index.mjs
...
```

### CHECKSUMS.json
```json
{
  "version": "v0.1.0",
  "generated": "2025-11-27T10:00:00Z",
  "checksums": {
    "index.js": "abc123...",
    ...
  }
}
```

---

## Secure Usage Guidelines

### 1. Air-Gapped Environments

For real mnemonics:
```bash
npm pack @grifortis/schiavinato-sharing
# Transfer to air-gapped machine
npm install grifortis-schiavinato-sharing-0.1.0.tgz
```

### 2. Verify Package Integrity

```bash
./scripts/verify-checksums.sh v0.1.0
npm audit signatures
```

### 3. Store Shares Securely

- Never store multiple shares together
- Use different physical locations
- Encrypt shares at rest

### 4. Test Thoroughly

- Test recovery before using real mnemonics
- Verify all shares work correctly

### 5. Keep Updated

```bash
npm outdated @grifortis/schiavinato-sharing
npm update @grifortis/schiavinato-sharing
```

---

## Dependencies

Audited libraries only:
- `@scure/bip39` - Audited BIP39 implementation
- `@noble/hashes` - Audited hash functions

Scanned by: GitHub Dependabot, npm audit

---

## Supported Versions

| Version | Supported | Status |
|---------|-----------|--------|
| 0.1.x   | ✅ Yes    | Active |
| < 0.1.0 | ❌ No     | Pre-release |

---

## Security Audit Status

- **Status**: Experimental - use at your own risk
- **Recommendation**: Independent audit recommended before production use with significant assets

See the [whitepaper](https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/latest/download/WHITEPAPER.pdf) ([LaTeX source](https://github.com/GRIFORTIS/schiavinato-sharing-spec/blob/main/WHITEPAPER.tex)) for full security analysis.

---

## Best Practices

### For Users
1. Verify checksums for every release
2. Use in air-gapped environments
3. Test recovery before real use
4. Store shares securely and separately
5. Keep software updated
6. Review security advisories

### For Contributors
1. Never commit secrets or private keys
2. Run security tests before PRs
3. Follow constant-time coding practices
4. Document security considerations
5. Report vulnerabilities privately
6. Keep dependencies updated

---

## Contact

- **Security**: security@grifortis.com
- **Response Time**: Within 48 hours

---

**Last Updated**: 2025-11-27

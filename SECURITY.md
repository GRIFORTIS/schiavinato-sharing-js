# Security Policy

## Reporting Security Vulnerabilities

We take the security of @grifortis/schiavinato-sharing seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report security issues by emailing: **security@grifortis.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

---

## Verifying Package Integrity

### SHA256 Checksums

Every release includes SHA256 checksums for verifying package integrity.

#### Download and Verify (Automated)

**Linux/macOS:**
```bash
# Download and run verification script
curl -fsSL https://raw.githubusercontent.com/GRIFORTIS/schiavinato-sharing-js/main/scripts/verify-checksums.sh | bash -s -- v0.1.0
```

**Windows PowerShell:**
```powershell
# Download and run verification script
Invoke-WebRequest -Uri https://raw.githubusercontent.com/GRIFORTIS/schiavinato-sharing-js/main/scripts/verify-checksums.ps1 -OutFile verify-checksums.ps1
.\verify-checksums.ps1 v0.1.0
```

#### Manual Verification

1. **Download checksums from GitHub release:**
   ```bash
   curl -fsSL https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/download/v0.1.0/CHECKSUMS.txt -o CHECKSUMS.txt
   ```

2. **Verify your local files:**
   ```bash
   # Linux/macOS
   cd node_modules/@grifortis/schiavinato-sharing
   sha256sum -c CHECKSUMS.txt
   
   # macOS (alternative)
   shasum -a 256 -c CHECKSUMS.txt
   ```

3. **Windows PowerShell:**
   ```powershell
   Get-FileHash -Algorithm SHA256 dist\index.js
   # Compare with CHECKSUMS.txt
   ```

#### JSON Format

Checksums are also available in JSON format for programmatic verification:

```bash
curl -fsSL https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/download/v0.1.0/CHECKSUMS.json
```

Example JSON structure:
```json
{
  "version": "v0.1.0",
  "generated": "2025-11-27T10:00:00Z",
  "checksums": {
    "index.js": "abc123...",
    "index.mjs": "def456...",
    "index.d.ts": "ghi789...",
    "index.d.mts": "jkl012...",
    "browser/index.global.js": "mno345..."
  }
}
```

---

## NPM Package Provenance

We publish packages with **provenance statements** using npm's transparency log.

Verify provenance:
```bash
npm audit signatures
```

This ensures:
- ✅ Package was built by GitHub Actions
- ✅ Source code matches the published package
- ✅ Build process is auditable

---

## Security Features

### Constant-Time Operations

All cryptographic comparisons use constant-time algorithms to prevent timing attacks:

- `constantTimeEqual()` - Field element comparison
- `constantTimeStringEqual()` - String comparison

See [TIMING_TESTS.md](./TIMING_TESTS.md) for implementation details.

### Memory Safety

Sensitive data is wiped from memory after use:

- `secureWipeArray()` - Clear number arrays
- `secureWipeNumber()` - Clear number variables
- `wipeString()` - Attempt to clear strings

See [SECURITY_ANALYSIS.md](./SECURITY_ANALYSIS.md) for complete analysis.

### Dependencies

We use only audited, well-maintained dependencies:

- `@scure/bip39` - Audited BIP39 implementation
- `@noble/hashes` - Audited hash functions

Dependencies are automatically scanned by:
- GitHub Dependabot
- npm audit
- Snyk (if configured)

---

## Secure Usage Guidelines

### 1. Air-Gapped Environments

For maximum security, use this library in air-gapped environments when handling real mnemonics:

```bash
# Download package offline
npm pack @grifortis/schiavinato-sharing

# Transfer to air-gapped machine
# Install from tarball
npm install grifortis-schiavinato-sharing-0.1.0.tgz
```

### 2. Verify Package Integrity

Always verify checksums before use in production:

```bash
./scripts/verify-checksums.sh v0.1.0
```

### 3. Store Shares Securely

- Never store multiple shares together
- Use different physical locations
- Consider using hardware security modules (HSMs)
- Encrypt shares at rest

### 4. Test Thoroughly

- Test recovery process before using real mnemonics
- Verify all shares work correctly
- Practice the recovery workflow

### 5. Keep Software Updated

```bash
# Check for updates
npm outdated @grifortis/schiavinato-sharing

# Update (after reviewing changes)
npm update @grifortis/schiavinato-sharing
```

---

## Supported Versions

| Version | Supported          | Status |
|---------|--------------------|--------|
| 0.1.x   | ✅ Yes             | Active |
| < 0.1.0 | ❌ No              | Pre-release |

---

## Security Audit Status

- **Last Audit**: Not yet audited
- **Status**: Experimental - use at your own risk
- **Recommendation**: Independent audit recommended before production use with significant assets

This is experimental software. See [WHITEPAPER.md](https://github.com/GRIFORTIS/schiavinato-sharing-spec/blob/main/WHITEPAPER.md) for full security analysis and responsible use guidelines.

---

## Security Best Practices

### For Users

1. ✅ Verify checksums for every release
2. ✅ Use in air-gapped environments
3. ✅ Test recovery before real use
4. ✅ Store shares securely and separately
5. ✅ Keep software updated
6. ✅ Review security advisories

### For Contributors

1. ✅ Never commit secrets or private keys
2. ✅ Run security tests before PRs
3. ✅ Follow constant-time coding practices
4. ✅ Document security considerations
5. ✅ Report vulnerabilities privately
6. ✅ Keep dependencies updated

---

## Security Contact

- **Email**: security@grifortis.com
- **PGP Key**: (Coming soon)
- **Response Time**: Within 48 hours

---

## Acknowledgments

We appreciate responsible disclosure and will credit security researchers who help improve this library (unless they prefer to remain anonymous).

---

**Last Updated**: 2025-11-27


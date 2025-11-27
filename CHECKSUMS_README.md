# 🔐 Automated SHA256 Checksums

## Overview

Every release of `@grifortis/schiavinato-sharing` includes **automatically generated SHA256 checksums** for all distributed files. This ensures package integrity and helps detect tampering.

---

## 🚀 How It Works

### Automatic Generation

When you create a GitHub release:

1. **GitHub Actions** workflow triggers (`.github/workflows/release.yml`)
2. **Builds** all distribution files
3. **Generates** SHA256 checksums for:
   - `dist/index.js` (CommonJS)
   - `dist/index.mjs` (ESM)
   - `dist/index.d.ts` (TypeScript declarations)
   - `dist/index.d.mts` (ESM TypeScript declarations)
   - `dist/browser/index.global.js` (Browser bundle)
4. **Creates** checksum files:
   - `CHECKSUMS.txt` - Human-readable format
   - `CHECKSUMS.json` - Machine-readable format
   - `*.tar.gz.sha256` - Tarball checksum
5. **Attaches** all checksums to GitHub release
6. **Comments** on release with checksums
7. **Publishes** to NPM with provenance

---

## 📥 Verifying Checksums

### Method 1: Automated Script (Recommended)

**Linux/macOS:**
```bash
# Verify specific version
npm run verify v0.1.0

# Or verify latest release
npm run verify:latest
```

**Windows PowerShell:**
```powershell
.\scripts\verify-checksums.ps1 v0.1.0
```

### Method 2: Manual Verification

1. **Download checksums:**
   ```bash
   curl -fsSL https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/download/v0.1.0/CHECKSUMS.txt -o CHECKSUMS.txt
   ```

2. **Build the project:**
   ```bash
   npm install
   npm run build
   ```

3. **Verify:**
   ```bash
   cd dist
   sha256sum -c ../CHECKSUMS.txt
   ```

### Method 3: NPM Audit Signatures

Verify provenance:
```bash
npm audit signatures
```

This verifies the package was:
- Built by GitHub Actions
- From the correct repository
- With the expected source code

---

## 📋 Checksum File Formats

### CHECKSUMS.txt (Human-Readable)

```
# SHA256 Checksums for @grifortis/schiavinato-sharing

Version: v0.1.0
Generated: 2025-11-27 10:00:00 UTC

## Main Package Files

abc123... dist/index.js
def456... dist/index.mjs
ghi789... dist/index.d.ts
jkl012... dist/index.d.mts

## Browser Bundle

mno345... dist/browser/index.global.js

## Verification

To verify files, run:
  sha256sum -c CHECKSUMS.txt
```

### CHECKSUMS.json (Machine-Readable)

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

## 🔄 Creating a New Release with Checksums

### Step 1: Update Version

```bash
# Bump version (patch, minor, or major)
npm version patch -m "Release v%s"
```

### Step 2: Push Changes

```bash
git push origin main --follow-tags
```

### Step 3: Create GitHub Release

1. Go to: https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/new
2. Select the version tag (e.g., `v0.1.1`)
3. Title: `v0.1.1`
4. Description: Copy from `CHANGELOG.md`
5. Click "Publish release"

### Step 4: Automatic Actions

The release workflow will automatically:
- ✅ Run tests
- ✅ Build all distribution files
- ✅ Generate SHA256 checksums
- ✅ Create tarball with checksums
- ✅ Attach checksums to release
- ✅ Publish to NPM with provenance
- ✅ Comment on release with checksums

**That's it!** No manual checksum generation needed.

---

## 🛠️ Scripts Available

### In package.json

```json
{
  "scripts": {
    "verify": "bash scripts/verify-checksums.sh",
    "verify:latest": "bash scripts/verify-checksums.sh latest"
  }
}
```

### Standalone Scripts

- `scripts/verify-checksums.sh` - Linux/macOS verification
- `scripts/verify-checksums.ps1` - Windows PowerShell verification

---

## 🔍 What Gets Checksummed

### Distribution Files

All files that users install via npm:

```
dist/
├── index.js           ✅ CommonJS bundle
├── index.mjs          ✅ ES Module bundle
├── index.d.ts         ✅ TypeScript types (CJS)
├── index.d.mts        ✅ TypeScript types (ESM)
└── browser/
    └── index.global.js ✅ Browser bundle
```

### Release Artifacts

Additional files in GitHub releases:

```
CHECKSUMS.txt              ✅ Human-readable checksums
CHECKSUMS.json             ✅ Machine-readable checksums
*.tar.gz                   ✅ Release tarball
*.tar.gz.sha256            ✅ Tarball checksum
```

---

## 🔐 Security Benefits

### 1. **Tampering Detection**
- Verify package hasn't been modified
- Detect supply chain attacks
- Confirm authentic distribution

### 2. **Transparency**
- Public checksums in releases
- Automated generation (no manual errors)
- Provenance via npm transparency log

### 3. **Compliance**
- Meet security audit requirements
- Industry best practice
- Required for some regulated industries

### 4. **Trust**
- Users can verify package integrity
- Independent verification possible
- Build reproducibility

---

## 🎯 Example Workflows

### For Package Users

```bash
# Install package
npm install @grifortis/schiavinato-sharing

# Verify checksums
cd node_modules/@grifortis/schiavinato-sharing
npm run verify:latest

# Or download verification script
curl -fsSL https://raw.githubusercontent.com/GRIFORTIS/schiavinato-sharing-js/main/scripts/verify-checksums.sh | bash -s -- v0.1.0
```

### For Security Auditors

```bash
# Clone repository
git clone https://github.com/GRIFORTIS/schiavinato-sharing-js.git
cd schiavinato-sharing-js

# Checkout specific version
git checkout v0.1.0

# Build from source
npm ci
npm run build

# Download published checksums
curl -fsSL https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/download/v0.1.0/CHECKSUMS.txt -o CHECKSUMS.txt

# Verify local build matches published checksums
cd dist
sha256sum -c ../CHECKSUMS.txt

# Verify npm package provenance
npm audit signatures
```

### For CI/CD Pipelines

```yaml
# .github/workflows/verify.yml
name: Verify Package
on: [push]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - run: npm run verify:latest
      - run: npm audit signatures
```

---

## 📚 Additional Resources

- **SECURITY.md** - Complete security policy
- **SECURITY_ANALYSIS.md** - Security implementation details
- **TIMING_TESTS.md** - Constant-time operation details
- **.github/workflows/release.yml** - Release automation workflow

---

## ❓ FAQ

### Q: Why SHA256?

A: SHA256 is cryptographically secure, widely supported, and industry standard for file integrity verification.

### Q: Can I verify older releases?

A: Yes! Checksums are attached to all GitHub releases. Just specify the version:
```bash
npm run verify v0.1.0
```

### Q: What if checksums don't match?

A: **DO NOT USE THE PACKAGE**. It may have been tampered with. Report to security@grifortis.com.

### Q: Are checksums signed?

A: Not with PGP, but npm provenance provides cryptographic verification via Sigstore transparency log.

### Q: How do I verify the npm package directly?

A: Use npm's built-in verification:
```bash
npm audit signatures
```

This verifies the package was built by our GitHub Actions and hasn't been tampered with.

### Q: Can I automate verification in my CI?

A: Yes! Add to your CI workflow:
```yaml
- run: npm audit signatures
- run: npm run verify:latest
```

---

## 🚀 Summary

✅ **Automatic** - No manual checksum generation  
✅ **Comprehensive** - All distribution files covered  
✅ **Multiple formats** - TXT and JSON  
✅ **Cross-platform** - Scripts for Linux/macOS/Windows  
✅ **Transparent** - Public checksums in releases  
✅ **Provenance** - npm transparency log integration  
✅ **Easy to verify** - One command verification  

**Every release is automatically secured with SHA256 checksums!** 🔒

---

**Last Updated**: 2025-11-27


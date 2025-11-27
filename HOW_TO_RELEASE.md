# How to Create a Release

Quick guide for creating releases with automated checksums and NPM publishing.

---

## 🚀 Quick Release Process

### Step 1: Update Version Number

```bash
cd schiavinato-sharing-js

# For bug fixes (0.1.0 → 0.1.1)
npm version patch

# For new features (0.1.0 → 0.2.0)
npm version minor

# For breaking changes (0.1.0 → 1.0.0)
npm version major
```

This will:
- Update `package.json` version
- Create a git tag (e.g., `v0.1.1`)
- Create a git commit

### Step 2: Push to GitHub

```bash
git push origin main --follow-tags
```

**Important**: Use `--follow-tags` to push both the commit AND the version tag!

### Step 3: Create GitHub Release

#### Option A: Via Web Interface (Easiest)

1. **Go to releases page:**
   ```
   https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/new
   ```

2. **Click "Choose a tag"** and select your version tag (e.g., `v0.1.1`)

3. **Fill in release information:**
   - **Release title**: `v0.1.1` (same as tag)
   - **Description**: Copy the relevant section from `CHANGELOG.md`
   
   Example:
   ```markdown
   ## What's New in v0.1.1
   
   ### Added
   - Automated SHA256 checksum generation for all releases
   - Verification scripts for Linux/macOS and Windows
   - Comprehensive security documentation
   
   ### Security
   - All releases include SHA256 checksums
   - NPM provenance enabled for transparency
   - Package integrity verification tools
   
   ### Documentation
   - Added SECURITY.md
   - Added CHECKSUMS_README.md
   - Added HOW_TO_RELEASE.md
   
   **Full Changelog**: https://github.com/GRIFORTIS/schiavinato-sharing-js/blob/main/CHANGELOG.md
   ```

4. **Click "Publish release"**

5. **Watch the automation! ✨**
   - Go to Actions tab
   - Watch "Release with Checksums" workflow run
   - After completion, refresh the release page
   - You'll see checksums attached!

#### Option B: Via GitHub CLI

```bash
# Install GitHub CLI if you don't have it
brew install gh  # macOS
# or visit: https://cli.github.com/

# Login
gh auth login

# Create release
gh release create v0.1.1 \
  --title "v0.1.1" \
  --notes "See CHANGELOG.md for details"
```

---

## 📝 Update CHANGELOG First!

**Before creating a release**, update `CHANGELOG.md`:

```markdown
## [0.1.1] - 2025-11-27

### Added
- Your new features here

### Fixed
- Your bug fixes here

### Security
- Security improvements here
```

Then follow the release steps above.

---

## 🤖 What Happens Automatically

When you publish a GitHub release, the workflow automatically:

1. ✅ **Runs all tests** (100 tests must pass)
2. ✅ **Builds the project** (CJS, ESM, types, browser)
3. ✅ **Generates SHA256 checksums** for all files
4. ✅ **Creates CHECKSUMS.txt** (human-readable)
5. ✅ **Creates CHECKSUMS.json** (machine-readable)
6. ✅ **Creates release tarball** with checksums
7. ✅ **Attaches all files to release**:
   - `CHECKSUMS.txt`
   - `CHECKSUMS.json`
   - `grifortis-schiavinato-sharing-v0.1.1.tar.gz`
   - `grifortis-schiavinato-sharing-v0.1.1.tar.gz.sha256`
8. ✅ **Publishes to NPM** with provenance
9. ✅ **Comments on release** with checksums

**Total time**: ~2-3 minutes

---

## 🔍 Verify Release Worked

### Check GitHub Release

Visit: https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/latest

You should see:
- ✅ Release title and description
- ✅ **Assets section** with:
  - `CHECKSUMS.txt`
  - `CHECKSUMS.json`
  - `*.tar.gz`
  - `*.tar.gz.sha256`
- ✅ **Comment** with checksums in code block
- ✅ **Source code** (zip and tar.gz)

### Check NPM

Visit: https://www.npmjs.com/package/@grifortis/schiavinato-sharing

You should see:
- ✅ New version number
- ✅ "Published X minutes ago"
- ✅ Provenance badge (shield icon)

### Check GitHub Actions

Visit: https://github.com/GRIFORTIS/schiavinato-sharing-js/actions

You should see:
- ✅ "Release with Checksums" workflow completed
- ✅ All steps green
- ✅ Checksums in workflow logs

---

## 📊 Complete Example

Let's say you want to release v0.1.1:

```bash
# 1. Make your changes
# ... edit files ...
git add .
git commit -m "Add new features for v0.1.1"

# 2. Update CHANGELOG.md
# ... add your changes to CHANGELOG.md ...
git add CHANGELOG.md
git commit -m "Update CHANGELOG for v0.1.1"

# 3. Update version
npm version patch
# Output: v0.1.1

# 4. Push everything
git push origin main --follow-tags

# 5. Create GitHub release
# Go to: https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/new
# - Choose tag: v0.1.1
# - Title: v0.1.1
# - Description: Copy from CHANGELOG.md
# - Click "Publish release"

# 6. Wait 2-3 minutes

# 7. Verify
# Check releases page for checksums
# Check NPM for new version
# Check Actions for successful workflow
```

---

## 🎯 First Release (v0.1.0)

You already published v0.1.0 to NPM, but let's create a proper GitHub release with checksums:

### Option 1: Create v0.1.0 Release Retroactively

Since v0.1.0 is already on NPM, create the GitHub release manually:

1. **Go to releases:**
   ```
   https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/new
   ```

2. **Select tag:** `v0.1.0` (if tag exists) or create new tag `v0.1.0`

3. **Title:** `v0.1.0 - Initial Release`

4. **Description:**
   ```markdown
   ## 🎉 Initial Release
   
   First production release of @grifortis/schiavinato-sharing!
   
   ### Features
   - ✅ BIP39 mnemonic splitting (k-of-n threshold)
   - ✅ BIP39 mnemonic recovery with validation
   - ✅ Support for 12-word and 24-word mnemonics
   - ✅ Row and master checksum validation
   - ✅ Constant-time operations (timing attack prevention)
   - ✅ Memory wiping for sensitive data
   - ✅ 94.28% test coverage (100 tests)
   - ✅ TypeScript support
   - ✅ Browser and Node.js compatible
   
   ### Security
   - Uses audited @scure/bip39 for BIP39 validation
   - Uses audited @noble/hashes for SHA-256
   - Constant-time checksum comparisons
   - Secure memory wiping utilities
   - Cryptographically secure random number generation
   
   ### Installation
   
   ```bash
   npm install @grifortis/schiavinato-sharing
   ```
   
   ### Links
   - 📦 NPM: https://www.npmjs.com/package/@grifortis/schiavinato-sharing
   - 📖 Whitepaper: https://github.com/GRIFORTIS/schiavinato-sharing-spec
   - 🧪 Test Vectors: https://github.com/GRIFORTIS/schiavinato-sharing-spec/blob/main/TEST_VECTORS.md
   
   ---
   
   **Note**: This release was published to NPM manually. Starting with the next release, SHA256 checksums will be automatically generated and attached.
   ```

5. **Click "Publish release"**

### Option 2: Wait for v0.1.1

Create the first release with full automation when you release v0.1.1.

---

## 📝 Release Checklist Template

Use this checklist for each release:

```
BEFORE RELEASING:
[ ] All changes committed and pushed
[ ] CHANGELOG.md updated with changes
[ ] Tests passing locally (npm test)
[ ] Build successful (npm run build)
[ ] Linting passed (npm run lint)
[ ] Version number makes sense (patch/minor/major)

RELEASE PROCESS:
[ ] Run: npm version [patch|minor|major]
[ ] Run: git push origin main --follow-tags
[ ] Create GitHub release (web or CLI)
[ ] Wait for "Release with Checksums" workflow to complete

AFTER RELEASING:
[ ] Verify release has checksums attached
[ ] Verify package on NPM shows new version
[ ] Verify provenance badge on NPM
[ ] Test installation: npm install @grifortis/schiavinato-sharing@latest
[ ] Run verification: npm run verify:latest
[ ] Update documentation if needed
[ ] Announce release (if public)
```

---

## 🔧 Troubleshooting

### Release workflow didn't run

**Cause**: Workflow only runs when you create a GitHub release, not just a git tag.

**Fix**: Go to GitHub and create the release via the web interface.

### Checksums not attached

**Cause**: Workflow might have failed or is still running.

**Fix**: 
1. Check Actions tab for workflow status
2. Click on failed workflow to see logs
3. Most common issue: NPM_TOKEN not set correctly

### NPM publish failed

**Cause**: `NPM_TOKEN` secret not configured or incorrect.

**Fix**:
1. Go to: https://github.com/GRIFORTIS/schiavinato-sharing-js/settings/secrets/actions
2. Verify `NPM_TOKEN` exists (not `KENPM_TON`)
3. If wrong, delete and recreate with correct name

### Version conflict

**Cause**: Version already exists on NPM.

**Fix**: You can't republish the same version. Bump to next version.

---

## 💡 Tips

### Semantic Versioning

- **Patch (0.1.0 → 0.1.1)**: Bug fixes, no breaking changes
- **Minor (0.1.0 → 0.2.0)**: New features, no breaking changes
- **Major (0.1.0 → 1.0.0)**: Breaking changes

### Prerelease Versions

```bash
# Create a beta release
npm version prepatch --preid=beta
# Result: 0.1.1-beta.0

# Create an alpha release
npm version preminor --preid=alpha
# Result: 0.2.0-alpha.0
```

### Draft Releases

Create a draft release first:
1. Go to releases page
2. Click "Draft a new release"
3. Fill in all details
4. Click "Save draft" (not "Publish release")
5. Review everything
6. Click "Publish release" when ready

---

## 📚 Related Documentation

- **CHANGELOG.md** - Version history
- **CHECKSUMS_README.md** - Checksums documentation
- **SECURITY.md** - Security policy
- **README_GITHUB_SETUP.md** - Initial GitHub setup
- **.github/workflows/release.yml** - Release automation

---

## 🎯 Your First Full Release (v0.1.1)

Let's practice! Here's exactly what to do:

```bash
# 1. Navigate to project
cd schiavinato-sharing-js

# 2. Make a small improvement (optional)
# Example: Update README, fix typo, etc.

# 3. Update CHANGELOG.md
# Add section for [0.1.1] with your changes

# 4. Commit CHANGELOG
git add CHANGELOG.md
git commit -m "Update CHANGELOG for v0.1.1"

# 5. Bump version
npm version patch
# Creates tag v0.1.1

# 6. Push with tags
git push origin main --follow-tags

# 7. Create release on GitHub
# Open browser to:
# https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/new

# 8. In the release form:
# - Tag version: v0.1.1 (select from dropdown)
# - Release title: v0.1.1
# - Description: Copy from CHANGELOG.md
# - Click "Publish release"

# 9. Watch automation
# Go to: https://github.com/GRIFORTIS/schiavinato-sharing-js/actions
# See "Release with Checksums" workflow running

# 10. After ~3 minutes, check release page
# Should have CHECKSUMS.txt attached!
```

---

## ⚡ Even Faster with GitHub CLI

```bash
# Install GitHub CLI
brew install gh  # macOS
# or: https://cli.github.com/

# One-time setup
gh auth login

# Then for each release:
npm version patch
git push origin main --follow-tags

# Create release with one command
gh release create v0.1.1 \
  --title "v0.1.1" \
  --notes-file <(cat << 'EOF'
## What's New

- Added automated SHA256 checksums
- Enhanced security documentation
- Improved CI/CD pipeline

See CHANGELOG.md for full details.
EOF
)

# Done! Automation handles the rest.
```

---

## 🎬 Video Guide (Do This)

### Creating Your First Release:

**1. Open your browser to:**
```
https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/new
```

**2. You'll see a form with:**
- "Choose a tag" dropdown
- "Release title" field
- "Describe this release" text area
- "Publish release" button

**3. Fill it in:**

**Choose a tag:**
- Click the dropdown
- If `v0.1.0` tag exists, select it
- If not, type `v0.1.0` and click "Create new tag: v0.1.0 on publish"

**Release title:**
```
v0.1.0 - Initial Release
```

**Describe this release:**
```markdown
## 🎉 Initial Release

First production release of @grifortis/schiavinato-sharing!

### Features
- ✅ Split BIP39 mnemonics into k-of-n shares
- ✅ Recover mnemonics from shares with validation
- ✅ Support for 12 and 24-word mnemonics
- ✅ Constant-time operations (timing attack prevention)
- ✅ 94.28% test coverage (100 tests passing)
- ✅ TypeScript + JavaScript support
- ✅ Browser and Node.js compatible

### Security
- Audited dependencies (@scure/bip39, @noble/hashes)
- Constant-time checksum comparisons
- Memory wiping utilities
- Automated SHA256 checksums

### Installation

```bash
npm install @grifortis/schiavinato-sharing
```

### Links
- 📦 NPM: https://www.npmjs.com/package/@grifortis/schiavinato-sharing
- 📖 Documentation: https://github.com/GRIFORTIS/schiavinato-sharing-js#readme
- 🔐 Security: https://github.com/GRIFORTIS/schiavinato-sharing-js/blob/main/SECURITY.md

Full changelog: https://github.com/GRIFORTIS/schiavinato-sharing-js/blob/main/CHANGELOG.md
```

**4. Click "Publish release"**

**5. Go to Actions tab and watch!**
```
https://github.com/GRIFORTIS/schiavinato-sharing-js/actions
```

---

## 🎉 After Release

### What You'll See

1. **On Release Page:**
   - 📄 CHECKSUMS.txt
   - 📄 CHECKSUMS.json
   - 📦 grifortis-schiavinato-sharing-v0.1.0.tar.gz
   - 🔐 grifortis-schiavinato-sharing-v0.1.0.tar.gz.sha256
   - 💬 Comment with checksums

2. **On NPM:**
   - New version published
   - Provenance badge showing
   - Links to GitHub

3. **On GitHub:**
   - Green checkmark on release
   - "Latest" badge on newest release
   - All files attached

---

## 🔄 Regular Release Cadence

### Suggested Schedule

- **Patch releases**: As needed for bug fixes
- **Minor releases**: Monthly or when features accumulate
- **Major releases**: When breaking changes are necessary

### Before Each Release

1. Review open issues and PRs
2. Update CHANGELOG.md
3. Run full test suite locally
4. Review security advisories
5. Test on multiple Node versions

---

## 📞 Need Help?

If something goes wrong:

1. **Check workflow logs**:
   - Go to Actions tab
   - Click on failed workflow
   - Read error messages

2. **Common issues**:
   - NPM_TOKEN not set → Add to secrets
   - Tests failing → Fix tests first
   - Build failing → Fix build errors
   - Network issues → Retry workflow

3. **Manual fallback**:
   ```bash
   npm publish --access public
   ```

---

## 🎯 Your Next Steps

### Right Now: Create v0.1.0 Release

Since you already published v0.1.0 to NPM:

1. **Go to:** https://github.com/GRIFORTIS/schiavinato-sharing-js/releases/new
2. **Create release for existing tag** `v0.1.0`
3. **Fill in description** (see template above)
4. **Publish**
5. **Watch checksums get generated!**

### Later: Create v0.1.1

When you have new changes:

1. Update CHANGELOG.md
2. `npm version patch`
3. `git push origin main --follow-tags`
4. Create GitHub release
5. Automation does everything else!

---

**You're all set!** 🚀

Go create that release! The automation will handle the checksums. ✨


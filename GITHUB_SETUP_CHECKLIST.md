# GitHub Setup Checklist

Use this checklist to verify your GitHub repository is fully configured.

## ✅ Completed Steps

### 1. ✅ Push Changes to GitHub
- [x] All files committed locally
- [x] Pushed to main branch
- [x] Recent commits visible: `a4b7136` (Fix CI), `952722d` (better linting)

### 2. ⏳ Enable GitHub Actions
**Status**: NEEDS VERIFICATION

**How to check:**
1. Go to: https://github.com/GRIFORTIS/schiavinato-sharing-js/actions
2. Look for:
   - [ ] "CI" workflow exists
   - [ ] "Publish to NPM" workflow exists
   - [ ] Recent workflow runs are visible
   - [ ] Latest run shows: ✅ All checks passed

**If Actions are disabled:**
1. Click "I understand my workflows, go ahead and enable them"
2. Wait for workflows to appear

**Expected Result**: You should see the latest push triggered a CI workflow that runs tests on Node 18, 20, and 22.

---

### 3. ⏳ Set Up Codecov (Optional but Recommended)
**Status**: CONFIGURED BUT TOKEN NOT ADDED

**Token**: `3b59c6f6-fd7f-404e-b678-c688b652809f`

**How to complete:**
1. Go to: https://github.com/GRIFORTIS/schiavinato-sharing-js/settings/secrets/actions
2. Click "New repository secret"
3. Add:
   - Name: `CODECOV_TOKEN`
   - Value: `3b59c6f6-fd7f-404e-b678-c688b652809f`
4. Save

**How to verify it's working:**
1. After next push, go to: https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js
2. You should see: 94.28% coverage report
3. CI workflow should show: ✅ "Upload coverage to Codecov" step passed

**If you skip this:** Coverage won't be tracked over time, but CI will still work.

---

### 4. ⏳ Set Up NPM Publishing (Optional)
**Status**: CONFIGURED BUT TOKEN NOT ADDED

**Only needed if you want automatic publishing when creating GitHub releases.**

**How to complete:**
1. **Get NPM Token:**
   - Go to: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token"
   - Choose "Automation" type
   - Copy the token

2. **Add to GitHub:**
   - Go to: https://github.com/GRIFORTIS/schiavinato-sharing-js/settings/secrets/actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: (paste your NPM token)
   - Save

**How to verify it's working:**
- Create a GitHub release
- Check Actions tab for "Publish to NPM" workflow
- Check npmjs.com for your published package

**If you skip this:** You'll need to publish manually with `npm publish`

---

### 5. ⏳ Verify CI is Working
**Status**: NEEDS VERIFICATION

**How to check:**
1. Go to: https://github.com/GRIFORTIS/schiavinato-sharing-js/actions
2. Click on the most recent "CI" workflow run
3. Verify all jobs passed:
   - [ ] Test on Node.js 18.x ✅
   - [ ] Test on Node.js 20.x ✅
   - [ ] Test on Node.js 22.x ✅
   - [ ] Build ✅

**Expected output in each test job:**
```
✓ test/field.test.ts (15 tests)
✓ test/security.test.ts (25 tests | 2 skipped)
✓ test/checksums.test.ts (8 tests)
✓ test/polynomial.test.ts (8 tests)
✓ test/lagrange.test.ts (12 tests)
✓ test/seedGenerator.test.ts (21 tests)
✓ test/integration.test.ts (13 tests)

Test Files  7 passed (7)
Tests  100 passed | 2 skipped (102)
```

**If CI is failing:**
- Check the error logs
- Most likely issue: Node.js version incompatibility
- See TIMING_TESTS.md for why 2 tests are skipped

---

### 6. ⏳ Add Status Badges to README
**Status**: NOT DONE YET

**How to complete:**
1. Open your main `README.md` file
2. Add these badges at the top (after the title):

```markdown
[![CI](https://github.com/GRIFORTIS/schiavinato-sharing-js/workflows/CI/badge.svg)](https://github.com/GRIFORTIS/schiavinato-sharing-js/actions)
[![codecov](https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js/graph/badge.svg?token=3b59c6f6-fd7f-404e-b678-c688b652809f)](https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js)
[![npm version](https://badge.fury.io/js/%40grifortis%2Fschiavinato-sharing.svg)](https://www.npmjs.com/package/@grifortis/schiavinato-sharing)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

3. Commit and push:
```bash
git add README.md
git commit -m "Add status badges to README"
git push
```

**What badges show:**
- CI badge: Shows if tests are passing
- Codecov badge: Shows test coverage percentage
- NPM badge: Shows latest published version
- License badge: Shows MIT license

---

### 7. ⏳ Enable Branch Protection (Highly Recommended)
**Status**: NOT DONE YET

**Why it's important:**
- Prevents direct pushes to main
- Requires tests to pass before merging
- Enforces code review process

**How to complete:**
1. Go to: https://github.com/GRIFORTIS/schiavinato-sharing-js/settings/branches
2. Click "Add rule" or "Add branch protection rule"
3. Branch name pattern: `main`
4. Enable these settings:
   - [x] Require a pull request before merging
   - [x] Require approvals: 1
   - [x] Require status checks to pass before merging
   - [x] Require branches to be up to date before merging
5. Under "Status checks", select:
   - [x] Test on Node.js 18.x
   - [x] Test on Node.js 20.x
   - [x] Test on Node.js 22.x
   - [x] Build
6. Enable (optional but recommended):
   - [x] Require conversation resolution before merging
   - [x] Do not allow bypassing the above settings
7. Click "Create" or "Save changes"

**Result:** No one (including you) can push directly to main without:
- Creating a pull request
- Passing all CI checks
- Getting approval (if you set that)

---

## 🎯 Quick Verification Commands

Run these to verify your local setup:

```bash
cd schiavinato-sharing-js

# Verify tests pass locally
npm test
# Expected: 100 passed | 2 skipped (102)

# Verify linting passes
npm run lint
# Expected: No errors

# Verify build works
npm run build
# Expected: Build success, dist/ folder created

# Verify type checking
npm run typecheck
# Expected: No errors

# Check coverage
npm run test:coverage
# Expected: 94.28% coverage
```

---

## 📋 Summary Checklist

Mark these off as you complete them:

### Essential (Required for CI to work)
- [x] **Push all changes to GitHub**
- [ ] **Enable GitHub Actions** → Check: https://github.com/GRIFORTIS/schiavinato-sharing-js/actions
- [ ] **Verify CI passes** → Check latest workflow run

### Recommended (Better experience)
- [ ] **Add Codecov token** → Go to Settings → Secrets
- [ ] **Add status badges** → Edit README.md
- [ ] **Enable branch protection** → Go to Settings → Branches

### Optional (For publishing)
- [ ] **Add NPM token** → Go to Settings → Secrets
- [ ] **Test release workflow** → Create a test release

---

## 🔍 How to Check Everything at Once

### 1. Check CI Status
Visit: https://github.com/GRIFORTIS/schiavinato-sharing-js/actions

**What to look for:**
- ✅ Green checkmark next to latest commit
- All workflow runs showing "✓"
- No failed or pending jobs

### 2. Check Repository Status
Visit: https://github.com/GRIFORTIS/schiavinato-sharing-js

**What to look for:**
- Green checkmark next to latest commit
- "X workflows" link visible (usually shows 2)
- No warnings or errors in yellow/red

### 3. Check Secrets Configuration
Visit: https://github.com/GRIFORTIS/schiavinato-sharing-js/settings/secrets/actions

**What should be there:**
- `CODECOV_TOKEN` (if you added it)
- `NPM_TOKEN` (if you added it)

---

## ❓ Troubleshooting

### CI Shows "Actions are disabled"
1. Go to Settings → Actions → General
2. Select "Allow all actions and reusable workflows"
3. Click "Save"

### CI is Failing
1. Click on the failed workflow
2. Click on the failed job
3. Expand the failing step
4. Check error message
5. Common issues:
   - Node version mismatch → CI uses 18, 20, 22
   - Missing dependencies → Run `npm ci` in CI
   - Timing tests failing → These should be skipped now

### Codecov Not Uploading
1. Verify `CODECOV_TOKEN` is added to secrets
2. Check workflow logs for "Upload coverage" step
3. Verify token is correct: `3b59c6f6-fd7f-404e-b678-c688b652809f`

### Badges Not Showing
1. Verify workflow name is "CI" (case-sensitive)
2. Wait a few minutes for GitHub to generate badge
3. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## ✅ When Everything is Set Up

You'll know everything is working when:

1. ✅ **Actions tab** shows green checkmarks
2. ✅ **README** displays status badges (all green)
3. ✅ **Pull requests** show status checks
4. ✅ **Codecov** shows coverage reports
5. ✅ **Branch protection** prevents direct pushes
6. ✅ **Releases** trigger automatic NPM publish (if configured)

---

## 🚀 Next Steps After Setup

Once everything is verified:

1. **Create a PR to test the workflow**
   ```bash
   git checkout -b test-ci
   echo "# Test" >> TEST.md
   git add TEST.md
   git commit -m "Test CI workflow"
   git push origin test-ci
   ```
   Then create a PR and verify checks run

2. **Update main README.md** with project information

3. **Set up automatic releases** using semantic versioning

4. **Consider adding:**
   - Dependabot for dependency updates
   - CodeQL for security scanning
   - Release-please for automated releases

---

## 📚 Documentation Reference

- `TESTING.md` - How to run tests locally
- `TIMING_TESTS.md` - Why timing tests are skipped
- `SECURITY_ANALYSIS.md` - Security review and findings
- `README_GITHUB_SETUP.md` - This file (detailed instructions)
- `.github/CODECOV_SETUP.md` - Codecov-specific setup
- `.github/workflows/ci.yml` - CI workflow definition
- `.github/workflows/publish.yml` - NPM publish workflow

---

**Last updated**: After commit `a4b7136` (Fix CI: Skip unreliable timing tests)


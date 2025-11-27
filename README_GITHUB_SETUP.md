# GitHub Repository Setup Guide

## Steps to Enable CI/CD on GitHub

### 1. Push Changes to GitHub

First, commit and push all the new files:

```bash
cd schiavinato-sharing-js

# Add new files
git add .github/
git add .husky/
git add .eslintrc.json
git add SECURITY_ANALYSIS.md
git add TESTING.md
git add README_GITHUB_SETUP.md

# Add modified files
git add CHANGELOG.md package.json .gitignore
git add src/ test/

# Commit
git commit -m "Add CI/CD workflows, git hooks, and security improvements

- Add GitHub Actions for CI and NPM publishing
- Add Husky pre-commit and pre-push hooks
- Add wipeString function for memory security
- Add comprehensive test coverage (94.28%)
- Add security analysis documentation
- Fix all linting errors
- Add ESLint configuration"

# Push
git push origin main
```

### 2. Enable GitHub Actions

1. Go to your repository: https://github.com/GRIFORTIS/schiavinato-sharing-js
2. Click on "Actions" tab
3. If Actions are disabled, click "I understand my workflows, go ahead and enable them"
4. You should see two workflows:
   - **CI** - Runs on every push and PR
   - **Publish to NPM** - Runs when you create a release

### 3. Set Up Codecov (Recommended - Track Coverage Over Time)

**Your Codecov token**: `3b59c6f6-fd7f-404e-b678-c688b652809f`

1. **Add token to GitHub Secrets:**
   - Go to: https://github.com/GRIFORTIS/schiavinato-sharing-js/settings/secrets/actions
   - Click "New repository secret"
   - Name: `CODECOV_TOKEN`
   - Value: `3b59c6f6-fd7f-404e-b678-c688b652809f`
   - Click "Add secret"

2. **That's it!** Coverage will upload automatically on every push

3. **View your coverage:**
   - Dashboard: https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js
   - Current coverage: 94.28% ✅

For detailed setup, see `.github/CODECOV_SETUP.md`

### 4. Set Up NPM Publishing

To enable automatic publishing to NPM when you create a release:

1. **Generate NPM Token:**
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token"
   - Choose "Automation" type
   - Copy the token

2. **Add Token to GitHub:**
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: (paste the NPM token)

### 5. Verify CI is Working

After pushing:

1. Go to "Actions" tab on GitHub
2. You should see a CI workflow running
3. Click on it to see the progress
4. All checks should pass ✅

### 6. Add Status Badges to README

Add these badges at the top of your main `README.md`:

```markdown
# Schiavinato Sharing JS

[![CI](https://github.com/GRIFORTIS/schiavinato-sharing-js/workflows/CI/badge.svg)](https://github.com/GRIFORTIS/schiavinato-sharing-js/actions)
[![codecov](https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js/branch/main/graph/badge.svg)](https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js)
[![npm version](https://badge.fury.io/js/%40grifortis%2Fschiavinato-sharing.svg)](https://www.npmjs.com/package/@grifortis/schiavinato-sharing)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

### 7. Test the Workflow

Create a test commit to trigger CI:

```bash
echo "Testing CI" >> README.md
git add README.md
git commit -m "Test CI workflow"
git push origin main
```

Watch the Actions tab to see it run!

### 8. Enable Branch Protection (Recommended)

Protect the main branch by requiring CI to pass:

1. Go to Settings → Branches
2. Click "Add rule" for `main` branch
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Select checks: `test (18.x)`, `test (20.x)`, `test (22.x)`, `build`
4. Save changes

Now no one can push directly to main without tests passing!

## Publishing a New Version

### Method 1: Automated via GitHub Release (Recommended)

1. **Update version in package.json:**
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. **Push the version bump:**
   ```bash
   git push origin main --follow-tags
   ```

3. **Create GitHub Release:**
   - Go to Releases → "Create a new release"
   - Click "Choose a tag" → select the version tag (e.g., `v0.1.1`)
   - Title: "v0.1.1"
   - Description: Copy from CHANGELOG.md
   - Click "Publish release"

4. **Automatic Publishing:**
   - GitHub Actions will automatically run
   - Tests will run
   - Project will build
   - Package will be published to NPM
   - Check Actions tab to see progress

### Method 2: Manual Publishing

```bash
npm version patch
npm run prepublishOnly
npm publish
git push origin main --follow-tags
```

## What Happens on Each Event

### On Every Push to `main` or `develop`:
1. CI workflow starts
2. Tests run on Node 18, 20, and 22
3. Linter checks code style
4. TypeScript validates types
5. Coverage report generated
6. Project builds
7. Artifacts saved for 7 days

### On Every Pull Request:
1. Same as push, but for the PR branch
2. Results shown in PR checks
3. Must pass before merge (if branch protection enabled)

### Before Every Commit (Husky):
1. Linter runs
2. Type checking runs
3. Tests run
4. If any fail, commit is blocked

### Before Every Push (Husky):
1. Full test suite with coverage
2. Build verification
3. If any fail, push is blocked

### On GitHub Release:
1. Tests run
2. Project builds
3. Package published to NPM
4. Uses provenance for security

## Troubleshooting GitHub Actions

### CI Failing?

1. **Check the logs:**
   - Go to Actions tab
   - Click on the failed workflow
   - Review the error messages

2. **Common issues:**
   - Node version mismatch
   - Missing dependencies
   - Test failures
   - Linting errors

3. **Fix locally first:**
   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

### NPM Publishing Failing?

1. **Check NPM token:**
   - Verify token is valid
   - Token should be "Automation" type
   - Token should have publish permissions

2. **Check package name:**
   - Must be unique on NPM
   - Scoped packages need `@grifortis/` prefix
   - Check `publishConfig.access` is "public"

3. **Version conflicts:**
   - Ensure version doesn't already exist
   - Bump version with `npm version`

## Maintenance

### Keep Dependencies Updated

```bash
# Check for updates
npm outdated

# Update non-breaking changes
npm update

# Update to latest (including breaking)
npx npm-check-updates -u
npm install
```

### Keep GitHub Actions Updated

GitHub Actions uses Dependabot to update workflow dependencies. Review and merge PRs from Dependabot regularly.

## Security

### NPM Token Security
- Never commit NPM tokens to the repository
- Use GitHub Secrets for sensitive data
- Rotate tokens periodically
- Use "Automation" tokens (not "Publish" tokens) for CI/CD

### Dependency Security
- GitHub Dependabot will open PRs for security updates
- Review and merge security updates promptly
- Use `npm audit` to check for vulnerabilities

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [NPM Publishing Guide](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Codecov Documentation](https://docs.codecov.com/)

## Need Help?

- Check GitHub Actions logs for detailed error messages
- Review workflow files in `.github/workflows/`
- Check husky hooks in `.husky/`
- Open an issue if you encounter problems


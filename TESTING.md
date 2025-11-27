# Testing Guide

## Test Coverage

The Schiavinato Sharing JS library has **94.28% test coverage** with 102 tests across 7 test files.

### Coverage Breakdown

| Module | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| **Overall** | **94.28%** | **83.64%** | **96.77%** | **94.28%** |
| Core (field, lagrange, polynomial) | 99.37% | 97.43% | 100% | 99.37% |
| Schiavinato (checksums, recover, split) | 94.21% | 78.72% | 100% | 94.21% |
| Utils (random, security, validation, etc.) | 91.39% | 79.45% | 94.44% | 91.39% |

## Running Tests Manually in Cursor

### Method 1: Terminal in Cursor

1. Open terminal in Cursor (`` Ctrl+` `` or `` Cmd+` ``)
2. Navigate to the project:
   ```bash
   cd schiavinato-sharing-js
   ```
3. Run tests:
   ```bash
   # Run all tests
   npm test
   
   # Run tests in watch mode (auto-rerun on changes)
   npm run test:watch
   
   # Run tests with coverage report
   npm run test:coverage
   
   # Run linter
   npm run lint
   
   # Run type checking
   npm run typecheck
   
   # Run everything (same as CI)
   npm run lint && npm run typecheck && npm test
   ```

### Method 2: NPM Scripts View

1. In Cursor, open the Explorer sidebar
2. Look for "NPM SCRIPTS" section
3. Click on any script to run it:
   - `test` - Run all tests once
   - `test:watch` - Run tests in watch mode
   - `test:coverage` - Generate coverage report
   - `lint` - Check code style
   - `typecheck` - Check TypeScript types

### Method 3: Quick Test Specific File

```bash
# Test a specific file
npm test -- field.test.ts

# Test with pattern
npm test -- security
```

## Automated Testing (CI/CD)

### GitHub Actions Workflows

We've set up two GitHub Actions workflows:

#### 1. Continuous Integration (CI) - `.github/workflows/ci.yml`

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**What it does:**
- ✅ Runs tests on Node.js 18, 20, and 22
- ✅ Runs linter
- ✅ Runs type checking
- ✅ Generates coverage report
- ✅ Uploads coverage to Codecov
- ✅ Builds the project
- ✅ Creates build artifacts

**Status Badge:**
```markdown
![CI](https://github.com/GRIFORTIS/schiavinato-sharing-js/workflows/CI/badge.svg)
```

#### 2. Publish to NPM - `.github/workflows/publish.yml`

**Triggers:**
- When a new GitHub release is created

**What it does:**
- ✅ Runs full test suite
- ✅ Builds the project
- ✅ Publishes to NPM (requires NPM_TOKEN secret)

### Git Hooks (Husky)

We've configured Husky to run tests automatically during git operations:

#### Pre-commit Hook

**Runs before every commit:**
- ✅ `npm run lint` - Checks code style
- ✅ `npm run typecheck` - Validates TypeScript types
- ✅ `npm test` - Runs all tests

**If any check fails, the commit is blocked.**

#### Pre-push Hook

**Runs before every push:**
- ✅ `npm run test:coverage` - Full test suite with coverage
- ✅ `npm run build` - Ensures the project builds

**If any check fails, the push is blocked.**

### Setting Up Husky

**First-time setup** (after cloning the repo):

```bash
cd schiavinato-sharing-js
npm install
npm run prepare
```

This will:
1. Install Husky
2. Configure git hooks
3. Make hooks executable

**To temporarily bypass hooks** (not recommended):

```bash
# Skip pre-commit hook
git commit --no-verify -m "message"

# Skip pre-push hook
git push --no-verify
```

## Test Files

| File | Tests | Description |
|------|-------|-------------|
| `field.test.ts` | 15 | Tests for GF(2053) field operations |
| `lagrange.test.ts` | 12 | Tests for Lagrange interpolation |
| `polynomial.test.ts` | 8 | Tests for polynomial evaluation |
| `checksums.test.ts` | 8 | Tests for row and master checksums |
| `security.test.ts` | 25 | Tests for constant-time operations and memory wiping |
| `seedGenerator.test.ts` | 21 | Tests for BIP39 mnemonic generation |
| `integration.test.ts` | 13 | End-to-end tests using TEST_VECTORS.md |

## Coverage Report

After running `npm run test:coverage`, you can view the HTML coverage report:

```bash
# On macOS
open coverage/index.html

# On Linux
xdg-open coverage/index.html

# On Windows
start coverage/index.html
```

Or manually open: `schiavinato-sharing-js/coverage/index.html`

## Continuous Monitoring

### GitHub Checks

Every pull request and push will show:
- ✅ All tests passing
- ✅ Linting passing  
- ✅ Type checking passing
- ✅ Build succeeding
- ✅ Coverage report

### Codecov Integration

Coverage reports are uploaded to Codecov on every CI run. To view:
1. Go to https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js
2. View coverage trends over time
3. See per-file coverage
4. Get coverage badges for README

## What Tests Don't Cover

The small percentage of uncovered code consists of:
- Error paths that are difficult to trigger (e.g., crypto API failures)
- Defensive error handling
- Platform-specific fallback code
- Some validation edge cases

These are intentionally defensive code paths that shouldn't occur in normal operation.

## Best Practices

1. **Always run tests before committing**
   - Hooks will enforce this, but run manually first to save time

2. **Write tests for new features**
   - Maintain the 94%+ coverage level
   - Add both unit and integration tests

3. **Check coverage for new code**
   - Run `npm run test:coverage` locally
   - Review coverage HTML report

4. **Fix failing tests immediately**
   - Don't push with failing tests
   - CI will block merges if tests fail

5. **Monitor CI status**
   - Check GitHub Actions tab
   - Fix CI failures promptly

## Troubleshooting

### Tests fail locally but CI passes
- Update dependencies: `npm ci`
- Check Node.js version: `node --version` (should be 18+)

### Hooks not running
- Reinstall Husky: `npm run prepare`
- Check `.husky/` directory exists
- Verify hooks are executable: `chmod +x .husky/*`

### Coverage report not generated
- Install coverage package: `npm install`
- Clear cache: `rm -rf coverage/ node_modules/.vitest/`

### Slow tests
- Use `npm run test:watch` for development
- It only runs tests affected by your changes

## Running Tests in Different Environments

### Local Development
```bash
npm run test:watch
```

### Before Committing
```bash
npm test && npm run lint && npm run typecheck
```

### Before Publishing
```bash
npm run prepublishOnly
```

### CI/CD (Automatic)
- Tests run on every push
- Tests run on every PR
- Tests run before publishing

## Need Help?

- Check test output for detailed error messages
- Review existing test files for examples
- See `CONTRIBUTING.md` for development guidelines
- Open an issue if tests are failing unexpectedly


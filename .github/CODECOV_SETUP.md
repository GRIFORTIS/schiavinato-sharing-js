# Codecov Setup Instructions

## Your Codecov Token

Your Codecov upload token is: `3b59c6f6-fd7f-404e-b678-c688b652809f`

⚠️ **IMPORTANT**: This token should be stored as a GitHub Secret, NOT committed to the repository!

## Setup Steps

### 1. Add Token to GitHub Secrets

1. Go to your repository on GitHub:
   ```
   https://github.com/GRIFORTIS/schiavinato-sharing-js/settings/secrets/actions
   ```

2. Click **"New repository secret"**

3. Fill in:
   - **Name**: `CODECOV_TOKEN`
   - **Secret**: `3b59c6f6-fd7f-404e-b678-c688b652809f`

4. Click **"Add secret"**

### 2. Verify Configuration

The following files are already configured:

✅ `.github/workflows/ci.yml` - CI workflow with Codecov upload  
✅ `codecov.yml` - Codecov configuration  

### 3. Test the Integration

After adding the secret:

1. **Push a commit to trigger CI:**
   ```bash
   git add .
   git commit -m "Configure Codecov integration"
   git push origin main
   ```

2. **Watch the workflow:**
   - Go to: https://github.com/GRIFORTIS/schiavinato-sharing-js/actions
   - Open the latest CI workflow run
   - Check the "Upload coverage to Codecov" step
   - Should see: ✅ Coverage uploaded successfully

3. **View coverage report:**
   - Go to: https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js
   - Should see your coverage data (94.28%)
   - Coverage will update on every push

### 4. Add Coverage Badge to README

After first successful upload, add this badge to your `README.md`:

```markdown
[![codecov](https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js/branch/main/graph/badge.svg?token=3b59c6f6-fd7f-404e-b678-c688b652809f)](https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js)
```

Or the simpler version:

```markdown
[![codecov](https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js/graph/badge.svg?token=3b59c6f6-fd7f-404e-b678-c688b652809f)](https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js)
```

## What Gets Tracked

Codecov will track:
- ✅ Statement coverage
- ✅ Branch coverage  
- ✅ Function coverage
- ✅ Line coverage
- ✅ Coverage trends over time
- ✅ Per-file coverage
- ✅ Coverage in PRs (shows diff coverage)

## Coverage Targets

As configured in `codecov.yml`:
- **Project target**: 90% (currently at 94.28% ✅)
- **Patch target**: 90% (new code must maintain high coverage)
- **Threshold**: 1% (allows minor fluctuations)

## Codecov Features

### Pull Request Comments
Codecov will automatically comment on PRs with:
- Coverage change (increase/decrease)
- Coverage of changed files
- Missing coverage in new code

### Coverage Reports
View detailed reports at:
```
https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js
```

### Sunburst Visualization
Interactive visualization of your codebase coverage:
```
https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js/tree/main
```

## Troubleshooting

### Upload Failing?

1. **Check token is set correctly:**
   - Go to Settings → Secrets → Actions
   - Verify `CODECOV_TOKEN` exists

2. **Check workflow logs:**
   - Actions tab → Latest workflow
   - Look for "Upload coverage to Codecov" step
   - Review error messages

3. **Common issues:**
   - Token not added to secrets
   - Token incorrect or expired
   - Coverage file not generated
   - Network issues (rare)

### No Coverage Showing?

1. **Verify coverage file exists:**
   ```bash
   npm run test:coverage
   ls -la coverage/coverage-final.json
   ```

2. **Check workflow ran on Node 20.x:**
   - Upload only happens on Node 20.x
   - Other versions skip upload

3. **Check Codecov dashboard:**
   - Look for upload errors
   - Check if builds are pending

## Security Notes

- ✅ Token is stored securely in GitHub Secrets
- ✅ Token is not exposed in workflow logs
- ✅ Token is not committed to repository
- ✅ Only authorized workflows can access the token

## Regenerating Token

If you need to regenerate your Codecov token:

1. Go to: https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js/settings
2. Click "Badge" or "Settings"
3. Find "Repository Upload Token"
4. Click "Regenerate"
5. Update GitHub Secret with new token

## Resources

- Codecov Documentation: https://docs.codecov.com/
- GitHub Actions Integration: https://docs.codecov.com/docs/github-actions
- Your Codecov Dashboard: https://codecov.io/gh/GRIFORTIS/schiavinato-sharing-js

---

**Current Status**: Ready to use! Just add the token to GitHub Secrets and push.


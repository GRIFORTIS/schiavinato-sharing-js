# Testing Guide

## Test Coverage

The Schiavinato Sharing JS library has **94%+ test coverage** with **100 tests** across 7 test files.

### Coverage Breakdown

| Module | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| **Overall** | **94.28%** | **83.64%** | **96.77%** | **94.28%** |
| Core (field, lagrange, polynomial) | 99.37% | 97.43% | 100% | 99.37% |
| Schiavinato (checksums, recover, split) | 94.21% | 78.72% | 100% | 94.21% |
| Utils (random, security, validation, etc.) | 91.39% | 79.45% | 94.44% | 91.39% |

---

## Running Tests

### Quick Start

```bash
# Install dependencies
npm install

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

---

## Test Structure

### Test Files

```
test/
├── field.test.ts           # GF(2053) field arithmetic
├── lagrange.test.ts        # Lagrange interpolation
├── polynomial.test.ts      # Polynomial operations
├── checksums.test.ts       # Checksum generation/validation
├── security.test.ts        # Security utilities
├── seedGenerator.test.ts   # Test mnemonic generation
└── integration.test.ts     # End-to-end workflows
```

### Test Categories

1. **Unit Tests**: Test individual functions and modules
2. **Integration Tests**: Test complete split/recover workflows
3. **Edge Cases**: Test boundary conditions and error handling
4. **Security Tests**: Verify security-critical operations

---

## Continuous Integration

Tests run automatically on:
- Every push to any branch
- Every pull request
- Before npm publish

See `.github/workflows/ci.yml` for CI configuration.

---

## Writing Tests

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { splitMnemonic, recoverMnemonic } from '../src';

describe('Schiavinato Sharing', () => {
  it('should split and recover a 24-word mnemonic', () => {
    const mnemonic = 'abandon abandon abandon ... about';
    const shares = splitMnemonic(mnemonic, 2, 3);
    
    const recovered = recoverMnemonic([shares[0], shares[1]]);
    
    expect(recovered).toBe(mnemonic);
  });
});
```

### Best Practices

- **Test one thing**: Each test should verify a single behavior
- **Clear names**: Test names should describe what they verify
- **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
- **Edge cases**: Test boundary conditions and error paths
- **No randomness**: Use deterministic test data

---

## Test Vectors

The library is tested against the official test vectors from the specification:

🔗 [TEST_VECTORS.md](https://github.com/GRIFORTIS/schiavinato-sharing-spec/blob/main/TEST_VECTORS.md)

These vectors ensure compatibility with other implementations and the reference specification.

---

## Coverage Reports

After running `npm run test:coverage`, view the detailed HTML report:

```bash
open coverage/index.html
```

The report shows:
- Line-by-line coverage
- Uncovered branches
- Function coverage
- File-by-file breakdown

---

## Contributing Tests

When contributing code, please:

1. **Add tests** for new features
2. **Maintain coverage** above 90%
3. **Test edge cases** and error conditions
4. **Follow existing patterns** in test files
5. **Run all tests** before submitting PR

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

## Troubleshooting

### Tests Fail Locally

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm test
```

### Coverage Not Generated

```bash
# Ensure vitest is installed
npm install --save-dev vitest @vitest/coverage-v8

# Run coverage
npm run test:coverage
```

### TypeScript Errors

```bash
# Check types
npm run typecheck

# Rebuild
npm run build
```

---

## Resources

- **Vitest Documentation**: https://vitest.dev/
- **Test Vectors**: [TEST_VECTORS.md](https://github.com/GRIFORTIS/schiavinato-sharing-spec/blob/main/TEST_VECTORS.md)
- **Specification**: [Whitepaper PDF](https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/latest/download/WHITEPAPER.pdf) ([LaTeX source](https://github.com/GRIFORTIS/schiavinato-sharing-spec/blob/main/WHITEPAPER.tex))

---

**Questions?** Open an issue or discussion on GitHub.

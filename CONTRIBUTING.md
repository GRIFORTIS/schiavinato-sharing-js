# Contributing to schiavinato-sharing-js

Thank you for your interest in contributing! This document provides guidelines for contributing to the JavaScript/TypeScript library.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Release Process](#release-process)

## Code of Conduct

This project follows the Contributor Covenant Code of Conduct. By participating, you agree to uphold this code.

### Zero-Knowledge Protocol

GRIFORTIS operates under a strict zero-knowledge protocol for consultancy and professional services. While this is primarily a business consideration, it informs our technical design:

- **User sovereignty**: Tools must enable users to maintain exclusive control of secrets
- **No custody assumptions**: Never design features that require trusting third parties with mnemonics
- **Advisory interfaces**: Guide users through processes they execute themselves

This library implements the core cryptographic operations while maintaining these principles.

## Getting Started

### Types of Contributions

We welcome:

- 🐛 **Bug fixes** – Fix issues in the library
- ✨ **Features** – Add new functionality (discuss first in an issue)
- 📖 **Documentation** – Improve README, code comments, examples
- 🧪 **Tests** – Add test coverage or improve existing tests
- ⚡ **Performance** – Optimize existing code
- 🔧 **Tooling** – Improve build, CI/CD, or development tools

### Before You Start

1. **Search existing issues** – Someone might already be working on it
2. **Open an issue first** – For significant changes, discuss the approach
3. **Review the specification** – Understand the [Schiavinato Sharing spec](https://github.com/GRIFORTIS/schiavinato-sharing-spec)
4. **Check test vectors** – Ensure compatibility with reference implementation

## Development Setup

### Prerequisites

- **Node.js**: 24+ (We recommend using [fnm](https://github.com/Schniz/fnm) to manage versions)
- **npm**: 9+ (comes with Node.js)
- **Tip**: Run `fnm use` in the project root to automatically select the correct version from `.nvmrc`.
- **Git**: Latest stable version

### Clone and Install

```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/schiavinato-sharing-js.git
cd schiavinato-sharing-js

# Install dependencies
npm install

# Run tests to verify setup
npm test
```

### Project Structure

```
schiavinato-sharing-js/
├── src/
│   ├── index.ts              # Main exports
│   ├── types.ts              # TypeScript type definitions
│   ├── core/                 # Core cryptographic primitives
│   │   ├── field.ts          # GF(2053) field arithmetic
│   │   ├── polynomial.ts     # Polynomial operations
│   │   └── lagrange.ts       # Lagrange interpolation
│   ├── schiavinato/          # Schiavinato-specific logic
│   │   ├── split.ts          # Splitting mnemonics
│   │   ├── recover.ts        # Recovering mnemonics
│   │   └── checksums.ts      # Checksum generation/validation
│   └── utils/                # Utility functions
│       ├── validation.ts     # Input validation
│       ├── security.ts       # Security utilities
│       ├── random.ts         # RNG wrapper
│       └── seedGenerator.ts  # BIP39 seed handling
├── test/                     # Test files (mirror src/ structure)
├── dist/                     # Build output (generated)
└── examples/                 # Usage examples
```

## Making Changes

### Development Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Edit files in src/

# Run tests continuously while developing
npm run test:watch

# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```

### Guidelines

1. **Keep changes focused** – One feature/fix per PR
2. **Write tests** – All new code should have tests
3. **Update documentation** – README, JSDoc comments, examples
4. **Follow TypeScript** – Use proper typing, avoid `any`
5. **No breaking changes** – Unless discussed in an issue
6. **Validate against test vectors** – Ensure compatibility with spec

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (for development)
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific test file
npx vitest run test/field.test.ts
```

### Writing Tests

Example test structure:

```typescript
import { describe, it, expect } from 'vitest';
import { splitMnemonic } from '../src/schiavinato/split';

describe('splitMnemonic', () => {
  it('should split a valid 12-word mnemonic', () => {
    const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const shares = splitMnemonic(mnemonic, 2, 3);
    
    expect(shares).toHaveLength(3);
    expect(shares[0]).toContain('share 1 of 3');
  });

  it('should throw ValidationError for invalid threshold', () => {
    const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    
    expect(() => splitMnemonic(mnemonic, 0, 3)).toThrow(ValidationError);
  });
});
```

### Test Requirements

- ✅ All new features must have tests
- ✅ Bug fixes should include regression tests
- ✅ Tests must pass on all Node.js versions (18, 20, 21)
- ✅ Coverage should not decrease
- ✅ Tests should be deterministic (no flaky tests)

## Pull Request Process

### Before Submitting

Checklist:

- [ ] Tests pass: `npm test`
- [ ] Types check: `npm run typecheck`
- [ ] Linter passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Coverage maintained or increased
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (for significant changes)
- [ ] Commits are clear and follow conventions

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

<longer description if needed>

<footer: breaking changes, issue references>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `test`: Adding or updating tests
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `chore`: Tooling, dependencies, etc.

**Examples:**
```
feat(split): add support for custom wordlists

fix(checksum): correct off-by-one error in validation

docs(readme): add browser usage examples

test(field): add edge cases for modular arithmetic
```

### Pull Request Template

When opening a PR, include:

1. **Description** – What does this PR do?
2. **Motivation** – Why is this needed?
3. **Changes** – List of specific changes
4. **Testing** – How was it tested?
5. **Breaking changes** – Any backwards incompatible changes?
6. **Related issues** – Links to related issues

### Review Process

1. **Automated checks** – CI must pass (tests, lint, build)
2. **Code review** – At least one maintainer approval required
3. **Testing** – Verify functionality works as expected
4. **Documentation** – Check that docs are updated
5. **Merge** – Squash and merge (maintainers will handle this)

## Coding Standards

### TypeScript

```typescript
// ✅ Good: Explicit types, clear names
export function splitMnemonic(
  mnemonic: string,
  threshold: number,
  totalShares: number
): string[] {
  // Implementation
}

// ❌ Bad: Implicit any, unclear names
export function split(m, k, n) {
  // Implementation
}
```

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line length**: 100 characters max
- **Naming**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and types
  - `UPPER_SNAKE_CASE` for constants

### Documentation

All public APIs must have JSDoc comments:

```typescript
/**
 * Splits a BIP39 mnemonic into shares using Schiavinato Sharing.
 * 
 * @param mnemonic - Valid BIP39 mnemonic phrase (12, 15, 18, 21, or 24 words)
 * @param threshold - Minimum shares needed for recovery (k)
 * @param totalShares - Total shares to generate (n), where k ≤ n ≤ 16
 * @param options - Optional configuration
 * @returns Array of share strings
 * @throws {ValidationError} If inputs are invalid
 * @throws {SecurityError} If RNG fails
 * 
 * @example
 * ```typescript
 * const shares = splitMnemonic(
 *   'abandon abandon ... about',
 *   2,
 *   3
 * );
 * ```
 */
export function splitMnemonic(
  mnemonic: string,
  threshold: number,
  totalShares: number,
  options?: SplitOptions
): string[] {
  // Implementation
}
```

## Release Process

**For maintainers only:**

1. Update version in `package.json` (follow semver)
2. Update `CHANGELOG.md`
3. Create Git tag: `git tag -a v0.2.0 -m "Release v0.2.0"`
4. Push tag: `git push origin v0.2.0`
5. Create GitHub Release
6. CI automatically publishes to npm

## Questions?

- **General questions**: [GitHub Discussions](https://github.com/GRIFORTIS/schiavinato-sharing-js/discussions)
- **Bug reports**: [Open an issue](https://github.com/GRIFORTIS/schiavinato-sharing-js/issues)
- **Security**: See [SECURITY.md](.github/SECURITY.md)
- **Specification questions**: See [spec repo](https://github.com/GRIFORTIS/schiavinato-sharing-spec)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉


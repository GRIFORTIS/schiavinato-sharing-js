# Testing Guide

This document explains how to run the JS/TS library tests locally and how conformance is validated.

---

## Quick start

```bash
npm ci
npm test
```

---

## Full local check (CI parity)

```bash
npm ci
npm run lint
npm run typecheck
npm test
```

---

## Conformance validation (canonical test vectors)

Conformance is defined by the canonical vectors in the specification repo:
- [TEST_VECTORS](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/test_vectors/README.md)

When changing behavior, update tests so the implementation remains compatible with the vectors version it claims to support.

---

## Contributing

See [CONTRIBUTING](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/.github/CONTRIBUTING.md).

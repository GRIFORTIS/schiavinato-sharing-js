/**
 * Fault Injection Tests
 *
 * Simulates hardware faults to verify dual-path integrity during splitBip39.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const faultController = {
  active: false,
  callCounter: 0,
  targetCallIndex: -1
};

vi.mock('../src/core/polynomial.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/core/polynomial.js')>();

  return {
    ...actual,
    evaluatePolynomial: (coefficients: number[], x: number) => {
      const result = actual.evaluatePolynomial(coefficients, x);

      if (faultController.active) {
        faultController.callCounter++;
        if (faultController.callCounter === faultController.targetCallIndex) {
          return (result + 1) % 2053;
        }
      }

      return result;
    }
  };
});

import { splitBip39 } from '../src/index';

describe('Integrity System (Fault Injection)', () => {
  beforeEach(() => {
    faultController.active = false;
    faultController.callCounter = 0;
    faultController.targetCallIndex = -1;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const TEST_MNEMONIC_12 =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

  // Per share (12 words, 4 rows, 3 cols, 1 GIC): 20 evaluatePolynomial calls
  // 1-12 words, 13-16 rows, 17-19 cols, 20 GIC

  it('should detect a Row Checksum mismatch (Path A vs Path B)', async () => {
    faultController.active = true;
    faultController.targetCallIndex = 13;

    await expect(splitBip39(TEST_MNEMONIC_12, 2, 3))
      .rejects.toThrow(/Row checksum path mismatch/);
  });

  it('should detect a Column Checksum mismatch (Path A vs Path B)', async () => {
    faultController.active = true;
    faultController.targetCallIndex = 17;

    await expect(splitBip39(TEST_MNEMONIC_12, 2, 3))
      .rejects.toThrow(/Column checksum path mismatch/);
  });

  it('should detect a Global Integrity Check mismatch (Path A vs Path B)', async () => {
    faultController.active = true;
    faultController.targetCallIndex = 20;

    await expect(splitBip39(TEST_MNEMONIC_12, 2, 3))
      .rejects.toThrow(/Global integrity path mismatch/);
  });

  it('should detect mismatch on subsequent shares (not just the first)', async () => {
    // Share 1 = 20 calls; Share 2 row 1 = call 20 + 13 = 33
    faultController.active = true;
    faultController.targetCallIndex = 33;

    await expect(splitBip39(TEST_MNEMONIC_12, 2, 3))
      .rejects.toThrow(/Row checksum path mismatch/);
  });
});

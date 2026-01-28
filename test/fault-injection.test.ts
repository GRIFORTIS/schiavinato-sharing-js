/**
 * Fault Injection Tests
 * 
 * These tests simulate hardware faults (e.g. bit flips, memory corruption) to verify
 * that the "Double-Check" integrity systems in splitMnemonic correctly detect
 * inconsistencies and abort the process.
 * 
 * We use vitest mocks to inject a single mathematical error into the polynomial
 * evaluation function at specific moments, triggering the "Path A vs Path B" mismatch logic.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 1. Setup the control mechanism for fault injection
const faultController = {
  active: false,
  callCounter: 0,
  targetCallIndex: -1 // Which call to evaluatePolynomial should return a wrong value
};

// 2. Mock the polynomial module
vi.mock('../src/core/polynomial.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/core/polynomial.js')>();
  
  return {
    ...actual,
    // Wrap the real function with our fault injector
    evaluatePolynomial: (coefficients: number[], x: number) => {
      // Always run the real logic first
      const result = actual.evaluatePolynomial(coefficients, x);
      
      if (faultController.active) {
        faultController.callCounter++;
        
        // If this is the targeted call, inject a fault
        if (faultController.callCounter === faultController.targetCallIndex) {
          // Return a mathematically incorrect result (simulating a bit flip)
          // We use (result + 1) mod 2053 to ensure it's a valid field element but wrong value
          return (result + 1) % 2053;
        }
      }
      
      return result;
    }
  };
});

// 3. Import the function under test (after mocking)
import { splitMnemonic } from '../src/index';
import { generateValidMnemonic } from '../src/utils/seedGenerator';

describe('Integrity System (Fault Injection)', () => {
  beforeEach(() => {
    // Reset fault controller before each test
    faultController.active = false;
    faultController.callCounter = 0;
    faultController.targetCallIndex = -1;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const TEST_MNEMONIC_12 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

  it('should detect a Row Checksum mismatch (Path A vs Path B)', async () => {
    // Scenario: 12 words, 2-of-3 scheme.
    // 
    // Call sequence for Share 1 generation:
    // 1-12:  Word polynomials (creates share.wordShares -> Path A source)
    // 13-16: Row checksum polynomials (Path B source)
    // 17:    GIC polynomial (Path B source)
    //
    // We target call #13 (First row, Path B calculation).
    // This makes the polynomial evaluation (Path B) disagree with the sum of words (Path A).
    
    faultController.active = true;
    faultController.targetCallIndex = 13; 

    await expect(splitMnemonic(TEST_MNEMONIC_12, 2, 3))
      .rejects
      .toThrow(/Row checksum path mismatch/);
  });

  it('should detect a Global Integrity Check mismatch (Path A vs Path B)', async () => {
    // Scenario: 12 words, 2-of-3 scheme.
    //
    // We target call #17 (GIC calculation for Share 1).
    // This makes the GIC polynomial evaluation (Path B) disagree with the sum of all words (Path A).
    
    faultController.active = true;
    faultController.targetCallIndex = 17;

    await expect(splitMnemonic(TEST_MNEMONIC_12, 2, 3))
      .rejects
      .toThrow(/Global Integrity Check \(GIC\) path mismatch/);
  });

  it('should detect mismatch on subsequent shares (not just the first)', async () => {
    // Scenario: Fault happens during Share 2 generation.
    //
    // Share 1 calls: 17 calls (12 words + 4 rows + 1 GIC)
    // Share 2 calls: 17 calls
    //
    // We want to target the first row of Share 2.
    // Target index = 17 (Share 1) + 13 (Row 1 of Share 2) = 30
    
    faultController.active = true;
    faultController.targetCallIndex = 30;

    await expect(splitMnemonic(TEST_MNEMONIC_12, 2, 3))
      .rejects
      .toThrow(/Row checksum path mismatch/);
  });
});

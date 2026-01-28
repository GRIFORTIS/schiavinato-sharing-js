/**
 * TEST_VECTORS.md Exact Reproduction Tests
 * 
 * This test validates that our implementation produces shares that match
 * TEST_VECTORS.md exactly when using the same coefficients.
 * 
 * IMPORTANT: This test does NOT modify production code. It manually constructs
 * polynomials using the known coefficients from TEST_VECTORS.md and validates
 * the mathematical operations (polynomial evaluation, checksum computation).
 * 
 * This approach:
 * - Keeps production code pure (no test hooks)
 * - Validates the core mathematical operations
 * - Matches what the HTML implementation does
 * - Tests share generation and recovery independently
 */

import { describe, it, expect } from 'vitest';
import { 
  evaluatePolynomial,
  computeRowCheckPolynomials,
  computeGlobalIntegrityCheckPolynomial,
  modAdd,
  recoverMnemonic
} from '../src/index';

describe('TEST_VECTORS.md Exact Reproduction', () => {
  // From TEST_VECTORS.md Section 3.1
  const testMnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';
  const wordIndices = [1680, 1471, 217, 42, 1338, 279, 1907, 324, 468, 682, 1844, 126];
  
  // From TEST_VECTORS.md Section 3.4 (random coefficients for 2-of-3 scheme)
  const coefficients = [1, 2052, 1126, 2012, 710, 571, 146, 1728, 2000, 130, 122, 383];
  
  // Expected shares from TEST_VECTORS.md Section 5
  const expectedShares = {
    1: {
      shareNumber: 1,
      wordShares: [1681, 1470, 1343, 1, 2048, 850, 0, 2052, 415, 812, 1966, 509],
      checksumShares: [388, 846, 414, 1234],
      globalIntegrityCheckShare: 830
    },
    2: {
      shareNumber: 2,
      wordShares: [1682, 1469, 416, 2013, 705, 1421, 146, 1727, 362, 942, 35, 892],
      checksumShares: [1514, 33, 182, 1869],
      globalIntegrityCheckShare: 1547
    },
    3: {
      shareNumber: 3,
      wordShares: [1683, 1468, 1542, 1972, 1415, 1992, 292, 1402, 309, 1072, 157, 1275],
      checksumShares: [587, 1273, 2003, 451],
      globalIntegrityCheckShare: 211
    }
  };

  describe('Share Generation (Manual Construction)', () => {
    it('should generate word shares matching TEST_VECTORS.md Section 5', () => {
      // Manually construct word polynomials (same as randomPolynomial but deterministic)
      // Each polynomial is f(x) = a₀ + a₁·x where a₀ = secret, a₁ = coefficient
      const wordPolynomials = wordIndices.map((secret, i) => [secret, coefficients[i]]);
      
      // Evaluate polynomials at x = 1, 2, 3
      for (let x = 1; x <= 3; x++) {
        const wordShares = wordPolynomials.map(poly => evaluatePolynomial(poly, x));
        
        expect(wordShares).toEqual(expectedShares[x as 1 | 2 | 3].wordShares);
      }
    });

    it('should generate row checksum shares matching TEST_VECTORS.md Section 5', () => {
      // Construct word polynomials
      const wordPolynomials = wordIndices.map((secret, i) => [secret, coefficients[i]]);
      
      // Compute row checksum polynomials (deterministic from word polynomials)
      const rowCheckPolynomials = computeRowCheckPolynomials(wordPolynomials);
      
      // Evaluate at x = 1, 2, 3
      for (let x = 1; x <= 3; x++) {
        const checksumShares = rowCheckPolynomials.map(poly => evaluatePolynomial(poly, x));
        
        expect(checksumShares).toEqual(expectedShares[x as 1 | 2 | 3].checksumShares);
      }
    });

    it('should generate GIC shares matching TEST_VECTORS.md Section 5', () => {
      // Construct word polynomials
      const wordPolynomials = wordIndices.map((secret, i) => [secret, coefficients[i]]);
      
      // Compute Global Integrity Check polynomial
      const gicPolynomial = computeGlobalIntegrityCheckPolynomial(wordPolynomials);
      
      // Evaluate at x = 1, 2, 3 and add share number
      for (let x = 1; x <= 3; x++) {
        const gicBase = evaluatePolynomial(gicPolynomial, x);
        const gicShare = modAdd(gicBase, x); // Add share number per TEST_VECTORS Section 3.3
        
        expect(gicShare).toBe(expectedShares[x as 1 | 2 | 3].globalIntegrityCheckShare);
      }
    });

    it('should generate complete shares matching TEST_VECTORS.md exactly', () => {
      // Construct word polynomials
      const wordPolynomials = wordIndices.map((secret, i) => [secret, coefficients[i]]);
      
      // Compute checksum polynomials
      const rowCheckPolynomials = computeRowCheckPolynomials(wordPolynomials);
      const gicPolynomial = computeGlobalIntegrityCheckPolynomial(wordPolynomials);
      
      // Generate all three shares
      for (let x = 1; x <= 3; x++) {
        const share = {
          shareNumber: x,
          wordShares: wordPolynomials.map(poly => evaluatePolynomial(poly, x)),
          checksumShares: rowCheckPolynomials.map(poly => evaluatePolynomial(poly, x)),
          globalIntegrityCheckShare: modAdd(evaluatePolynomial(gicPolynomial, x), x)
        };
        
        expect(share).toEqual(expectedShares[x as 1 | 2 | 3]);
      }
    });
  });

  describe('Recovery from TEST_VECTORS shares', () => {
    it('should recover from shares {1, 2}', async () => {
      const result = await recoverMnemonic(
        [expectedShares[1], expectedShares[2]],
        12
      );
      
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(testMnemonic);
      expect(result.errors.row).toHaveLength(0);
      expect(result.errors.global).toBe(false);
      expect(result.errors.bip39).toBe(false);
    });

    it('should recover from shares {1, 3}', async () => {
      const result = await recoverMnemonic(
        [expectedShares[1], expectedShares[3]],
        12
      );
      
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(testMnemonic);
      expect(result.errors.row).toHaveLength(0);
      expect(result.errors.global).toBe(false);
      expect(result.errors.bip39).toBe(false);
    });

    it('should recover from shares {2, 3}', async () => {
      const result = await recoverMnemonic(
        [expectedShares[2], expectedShares[3]],
        12
      );
      
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(testMnemonic);
      expect(result.errors.row).toHaveLength(0);
      expect(result.errors.global).toBe(false);
      expect(result.errors.bip39).toBe(false);
    });

    it('should recover from all 3 shares (overdetermined)', async () => {
      const result = await recoverMnemonic(
        [expectedShares[1], expectedShares[2], expectedShares[3]],
        12
      );
      
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(testMnemonic);
      expect(result.errors.row).toHaveLength(0);
      expect(result.errors.global).toBe(false);
      expect(result.errors.bip39).toBe(false);
    });
  });

  describe('Checksum Validation (Section 6 of TEST_VECTORS.md)', () => {
    it('should validate Share 1 checksums via direct summation', () => {
      const share = expectedShares[1];
      
      // Row 1: (1681 + 1470 + 1343) mod 2053 = 388
      expect((share.wordShares[0] + share.wordShares[1] + share.wordShares[2]) % 2053).toBe(388);
      expect(share.checksumShares[0]).toBe(388);
      
      // Row 2: (1 + 2048 + 850) mod 2053 = 846
      expect((share.wordShares[3] + share.wordShares[4] + share.wordShares[5]) % 2053).toBe(846);
      expect(share.checksumShares[1]).toBe(846);
      
      // Row 3: (0 + 2052 + 415) mod 2053 = 414
      expect((share.wordShares[6] + share.wordShares[7] + share.wordShares[8]) % 2053).toBe(414);
      expect(share.checksumShares[2]).toBe(414);
      
      // Row 4: (812 + 1966 + 509) mod 2053 = 1234
      expect((share.wordShares[9] + share.wordShares[10] + share.wordShares[11]) % 2053).toBe(1234);
      expect(share.checksumShares[3]).toBe(1234);
      
      // GIC: (388 + 846 + 414 + 1234 + 1) mod 2053 = 830
      const gicCheck = (share.checksumShares[0] + share.checksumShares[1] + 
                       share.checksumShares[2] + share.checksumShares[3] + 
                       share.shareNumber) % 2053;
      expect(gicCheck).toBe(830);
      expect(share.globalIntegrityCheckShare).toBe(830);
    });

    it('should validate Share 2 checksums via direct summation', () => {
      const share = expectedShares[2];
      
      // Row checksums
      expect((share.wordShares[0] + share.wordShares[1] + share.wordShares[2]) % 2053).toBe(share.checksumShares[0]);
      expect((share.wordShares[3] + share.wordShares[4] + share.wordShares[5]) % 2053).toBe(share.checksumShares[1]);
      expect((share.wordShares[6] + share.wordShares[7] + share.wordShares[8]) % 2053).toBe(share.checksumShares[2]);
      expect((share.wordShares[9] + share.wordShares[10] + share.wordShares[11]) % 2053).toBe(share.checksumShares[3]);
      
      // GIC
      const gicCheck = (share.checksumShares.reduce((a, b) => a + b, 0) + share.shareNumber) % 2053;
      expect(share.globalIntegrityCheckShare).toBe(gicCheck);
    });

    it('should validate Share 3 checksums via direct summation', () => {
      const share = expectedShares[3];
      
      // Row checksums
      expect((share.wordShares[0] + share.wordShares[1] + share.wordShares[2]) % 2053).toBe(share.checksumShares[0]);
      expect((share.wordShares[3] + share.wordShares[4] + share.wordShares[5]) % 2053).toBe(share.checksumShares[1]);
      expect((share.wordShares[6] + share.wordShares[7] + share.wordShares[8]) % 2053).toBe(share.checksumShares[2]);
      expect((share.wordShares[9] + share.wordShares[10] + share.wordShares[11]) % 2053).toBe(share.checksumShares[3]);
      
      // GIC
      const gicCheck = (share.checksumShares.reduce((a, b) => a + b, 0) + share.shareNumber) % 2053;
      expect(share.globalIntegrityCheckShare).toBe(gicCheck);
    });
  });
});

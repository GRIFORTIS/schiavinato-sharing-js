/**
 * Tests for dual-path checksum validation (introduced in v0.4.0)
 * 
 * These tests verify that Path A (direct sum) and Path B (polynomial evaluation)
 * produce identical results and can detect corruption/bit flips.
 */

import { describe, it, expect } from 'vitest';
import { 
  sumPolynomials, 
  computeRowCheckPolynomials, 
  computeGlobalIntegrityCheckPolynomial,
  computeRowChecks,
  computeGlobalIntegrityCheck
} from '../src/schiavinato/checksums';
import { evaluatePolynomial } from '../src/core/polynomial';
import { splitMnemonic, recoverMnemonic } from '../src/index';

describe('Polynomial Checksum Functions (introduced in v0.4.0)', () => {
  describe('sumPolynomials', () => {
    it('should sum polynomial coefficients modulo 2053', () => {
      const poly1 = [100, 200, 300]; // 100 + 200x + 300x²
      const poly2 = [50, 75, 100];   // 50 + 75x + 100x²
      
      const result = sumPolynomials([poly1, poly2]);
      
      expect(result).toEqual([150, 275, 400]); // 150 + 275x + 400x²
    });

    it('should handle modulo wraparound', () => {
      const poly1 = [2000, 2000];
      const poly2 = [2000, 2000];
      
      const result = sumPolynomials([poly1, poly2]);
      
      // 4000 mod 2053 = 1947
      expect(result).toEqual([1947, 1947]);
    });

    it('should sum multiple polynomials', () => {
      const poly1 = [100, 200];
      const poly2 = [50, 75];
      const poly3 = [25, 30];
      
      const result = sumPolynomials([poly1, poly2, poly3]);
      
      expect(result).toEqual([175, 305]);
    });

    it('should throw on empty array', () => {
      expect(() => sumPolynomials([])).toThrow('Cannot sum zero polynomials');
    });

    it('should throw on mismatched degrees', () => {
      const poly1 = [100, 200];      // degree 1
      const poly2 = [50, 75, 100];   // degree 2
      
      expect(() => sumPolynomials([poly1, poly2])).toThrow('degree mismatch');
    });
  });

  describe('computeRowCheckPolynomials', () => {
    it('should create row checksum polynomials for 12-word mnemonic', () => {
      // Create 12 simple degree-1 polynomials
      const wordPolynomials = [
        [1, 2], [3, 4], [5, 6],      // Row 0
        [7, 8], [9, 10], [11, 12],   // Row 1
        [13, 14], [15, 16], [17, 18], // Row 2
        [19, 20], [21, 22], [23, 24]  // Row 3
      ];
      
      const rowPolys = computeRowCheckPolynomials(wordPolynomials);
      
      expect(rowPolys).toHaveLength(4);
      
      // Row 0: sum of [1,2] + [3,4] + [5,6] = [9, 12]
      expect(rowPolys[0]).toEqual([9, 12]);
      
      // Row 1: sum of [7,8] + [9,10] + [11,12] = [27, 30]
      expect(rowPolys[1]).toEqual([27, 30]);
    });

    it('should create row checksum polynomials for 24-word mnemonic', () => {
      // Create 24 simple degree-1 polynomials
      const wordPolynomials = Array.from({ length: 24 }, (_, i) => [i + 1, (i + 1) * 2]);
      
      const rowPolys = computeRowCheckPolynomials(wordPolynomials);
      
      expect(rowPolys).toHaveLength(8); // 24 / 3 = 8 rows
    });

    it('should work with higher degree polynomials', () => {
      // Degree 2 polynomials (k=3)
      const wordPolynomials = [
        [1, 2, 3], [4, 5, 6], [7, 8, 9],
        [10, 11, 12], [13, 14, 15], [16, 17, 18],
        [19, 20, 21], [22, 23, 24], [25, 26, 27],
        [28, 29, 30], [31, 32, 33], [34, 35, 36]
      ];
      
      const rowPolys = computeRowCheckPolynomials(wordPolynomials);
      
      expect(rowPolys).toHaveLength(4);
      expect(rowPolys[0]).toHaveLength(3); // Same degree
    });
  });

  describe('computeGlobalIntegrityCheckPolynomial', () => {
    it('should create Global Integrity Check (GIC) polynomial', () => {
      const wordPolynomials = [
        [1, 2], [3, 4], [5, 6]
      ];
      
      const globalPoly = computeGlobalIntegrityCheckPolynomial(wordPolynomials);
      
      // Sum of all: [1+3+5, 2+4+6] = [9, 12]
      expect(globalPoly).toEqual([9, 12]);
    });

    it('should handle modulo wraparound', () => {
      const wordPolynomials = [
        [2000, 2000],
        [2000, 2000],
        [100, 100]
      ];
      
      const globalPoly = computeGlobalIntegrityCheckPolynomial(wordPolynomials);
      
      // (2000 + 2000 + 100) mod 2053 = 4100 mod 2053 = 2047
      expect(globalPoly).toEqual([2047, 2047]);
    });
  });

  describe('Path A vs Path B equivalence', () => {
    it('should produce identical results when evaluating checksum polynomials', () => {
      // Create simple word polynomials
      const wordPolynomials = [
        [100, 50], [200, 75], [300, 100], // Row 0
        [400, 125], [500, 150], [600, 175] // Row 1
      ];
      
      const rowPolys = computeRowCheckPolynomials(wordPolynomials);
      const globalPoly = computeGlobalIntegrityCheckPolynomial(wordPolynomials);
      
      // Test at multiple share numbers
      for (let shareNum = 1; shareNum <= 5; shareNum++) {
        // Evaluate word polynomials at this share
        const wordShares = wordPolynomials.map(p => evaluatePolynomial(p, shareNum));
        
        // Path A: Compute checksums from word shares
        const pathARows = computeRowChecks(wordShares);
        const pathAGlobal = computeGlobalIntegrityCheck(wordShares);
        
        // Path B: Evaluate checksum polynomials
        const pathBRows = rowPolys.map(p => evaluatePolynomial(p, shareNum));
        const pathBGlobal = evaluatePolynomial(globalPoly, shareNum);
        
        // Both paths must agree
        expect(pathARows).toEqual(pathBRows);
        expect(pathAGlobal).toEqual(pathBGlobal);
      }
    });

    it('should work with degree 2 polynomials (k=3)', () => {
      const wordPolynomials = [
        [100, 50, 25], [200, 75, 30], [300, 100, 35],
        [400, 125, 40], [500, 150, 45], [600, 175, 50],
        [700, 200, 55], [800, 225, 60], [900, 250, 65],
        [1000, 275, 70], [1100, 300, 75], [1200, 325, 80]
      ];
      
      const rowPolys = computeRowCheckPolynomials(wordPolynomials);
      const globalPoly = computeGlobalIntegrityCheckPolynomial(wordPolynomials);
      
      // Test at multiple share numbers
      for (let shareNum = 1; shareNum <= 5; shareNum++) {
        const wordShares = wordPolynomials.map(p => evaluatePolynomial(p, shareNum));
        
        const pathARows = computeRowChecks(wordShares);
        const pathAGlobal = computeGlobalIntegrityCheck(wordShares);
        
        const pathBRows = rowPolys.map(p => evaluatePolynomial(p, shareNum));
        const pathBGlobal = evaluatePolynomial(globalPoly, shareNum);
        
        expect(pathARows).toEqual(pathBRows);
        expect(pathAGlobal).toEqual(pathBGlobal);
      }
    });
  });

  describe('Integration with splitMnemonic', () => {
    const testMnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';

    it('should validate both paths during split (k=2)', async () => {
      // This should not throw - both paths should agree
      const shares = await splitMnemonic(testMnemonic, 2, 3);
      
      expect(shares).toHaveLength(3);
      expect(shares[0].checksumShares).toHaveLength(4);
    });

    it('should validate both paths during split (k=3)', async () => {
      const shares = await splitMnemonic(testMnemonic, 3, 5);
      
      expect(shares).toHaveLength(5);
      expect(shares[0].checksumShares).toHaveLength(4);
    });

    it('should validate both paths during split (k=4)', async () => {
      const shares = await splitMnemonic(testMnemonic, 4, 7);
      
      expect(shares).toHaveLength(7);
      expect(shares[0].checksumShares).toHaveLength(4);
    });

    it('should work with 24-word mnemonics', async () => {
      const mnemonic24 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art';
      
      const shares = await splitMnemonic(mnemonic24, 2, 3);
      
      expect(shares).toHaveLength(3);
      expect(shares[0].wordShares).toHaveLength(24);
      expect(shares[0].checksumShares).toHaveLength(8); // 24 / 3 = 8 rows
    });
  });

  describe('Integration with recoverMnemonic', () => {
    const testMnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';

    it('should validate both paths during recovery', async () => {
      const shares = await splitMnemonic(testMnemonic, 2, 3);
      
      const result = await recoverMnemonic([shares[0], shares[1]], 12);
      
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(testMnemonic);
      expect(result.errors.rowPathMismatch).toHaveLength(0);
      expect(result.errors.globalPathMismatch).toBe(false);
    });

    it('should detect checksum errors with corrupted checksum share', async () => {
      const shares = await splitMnemonic(testMnemonic, 2, 3);
      
      // Corrupt a checksum share with a valid but incorrect value
      const corruptedShare = {
        ...shares[0],
        checksumShares: [...shares[0].checksumShares]
      };
      const originalValue = corruptedShare.checksumShares[0];
      corruptedShare.checksumShares[0] = (originalValue + 100) % 2053;
      
      const result = await recoverMnemonic([corruptedShare, shares[1]], 12);
      
      expect(result.success).toBe(false);
      // Should detect checksum error (path mismatch, row error, or BIP39 failure)
      const hasError = result.errors.rowPathMismatch!.length > 0 || 
                      result.errors.row.length > 0 ||
                      result.errors.bip39;
      expect(hasError).toBe(true);
    });

    it('should detect checksum errors with corrupted Global Integrity Check (GIC)', async () => {
      const shares = await splitMnemonic(testMnemonic, 2, 3);
      
      // Corrupt the Global Integrity Check (GIC) share with a valid but incorrect value
      const corruptedShare = {
        ...shares[0],
        globalIntegrityCheckShare: (shares[0].globalIntegrityCheckShare + 100) % 2053
      };
      
      const result = await recoverMnemonic([corruptedShare, shares[1]], 12);
      
      expect(result.success).toBe(false);
      // Should detect checksum error (path mismatch, global error, or BIP39 failure)
      const hasError = result.errors.globalPathMismatch || 
                      result.errors.global || 
                      result.errors.bip39;
      expect(hasError).toBe(true);
    });

    it('should work with higher thresholds (k=3)', async () => {
      const shares = await splitMnemonic(testMnemonic, 3, 5);
      
      const result = await recoverMnemonic([shares[0], shares[2], shares[4]], 12);
      
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(testMnemonic);
      expect(result.errors.rowPathMismatch).toHaveLength(0);
      expect(result.errors.globalPathMismatch).toBe(false);
    });
  });

  describe('Error messages', () => {
    it('should provide clear error message for polynomial degree mismatch', () => {
      const poly1 = [100, 200];      // length 2 = degree 1
      const poly2 = [50, 75, 100];   // length 3 = degree 2
      
      expect(() => sumPolynomials([poly1, poly2])).toThrow(
        'Polynomial degree mismatch: expected 1 but got 2 at index 1'
      );
    });
  });
});

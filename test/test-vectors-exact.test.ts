/**
 * Frozen v0.5.0 test vector exact reproduction
 *
 * Manually constructs polynomials using known coefficients from
 * previous_versions/v0.5.0/test_vectors and validates math + recovery.
 */

import { describe, it, expect } from 'vitest';
import {
  evaluatePolynomial,
  computeRowCheckPolynomials,
  computeColumnCheckPolynomials,
  computeGlobalIntegrityCheckPolynomial,
  modAdd,
  recoverAndValidate
} from '../src/index';

describe('v0.5.0 test vectors exact reproduction', () => {
  const testMnemonic =
    'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';
  const wordIndices = [
    1680, 1471, 217, 42, 1338, 279, 1907, 324, 468, 682, 1844, 126
  ];
  const coefficients = [
    1, 2052, 1126, 2012, 710, 571, 146, 1728, 2000, 130, 122, 383
  ];

  const expectedShares = {
    1: {
      shareNumber: 1,
      wordShares: [1681, 1470, 1343, 1, 2048, 850, 0, 2052, 415, 812, 1966, 509],
      checksumShares: [389, 848, 417, 1238],
      columnChecksumShares: [451, 1397, 1094],
      globalIntegrityCheckShare: 900
    },
    2: {
      shareNumber: 2,
      wordShares: [1682, 1469, 416, 2013, 705, 1421, 146, 1727, 362, 942, 35, 892],
      checksumShares: [1515, 35, 185, 1873],
      columnChecksumShares: [687, 1903, 1068],
      globalIntegrityCheckShare: 1617
    },
    3: {
      shareNumber: 3,
      wordShares: [1683, 1468, 1542, 1972, 1415, 1992, 292, 1402, 309, 1072, 157, 1275],
      checksumShares: [588, 1275, 2006, 455],
      columnChecksumShares: [923, 356, 1042],
      globalIntegrityCheckShare: 281
    }
  };

  describe('Share generation (manual construction)', () => {
    it('should generate word shares matching frozen vector', () => {
      const wordPolynomials = wordIndices.map((secret, i) => [
        secret,
        coefficients[i]
      ]);
      for (let x = 1; x <= 3; x++) {
        expect(
          wordPolynomials.map((poly) => evaluatePolynomial(poly, x))
        ).toEqual(expectedShares[x as 1 | 2 | 3].wordShares);
      }
    });

    it('should generate row/column/GIC shares matching frozen vector', () => {
      const wordPolynomials = wordIndices.map((secret, i) => [
        secret,
        coefficients[i]
      ]);
      const rowCheckPolynomials = computeRowCheckPolynomials(wordPolynomials);
      const columnCheckPolynomials =
        computeColumnCheckPolynomials(wordPolynomials);
      const gicPolynomial =
        computeGlobalIntegrityCheckPolynomial(wordPolynomials);

      for (let x = 1; x <= 3; x++) {
        const share = {
          shareNumber: x,
          wordShares: wordPolynomials.map((poly) =>
            evaluatePolynomial(poly, x)
          ),
          checksumShares: rowCheckPolynomials.map((poly) =>
            evaluatePolynomial(poly, x)
          ),
          columnChecksumShares: columnCheckPolynomials.map((poly) =>
            evaluatePolynomial(poly, x)
          ),
          globalIntegrityCheckShare: modAdd(
            evaluatePolynomial(gicPolynomial, x),
            x
          )
        };
        expect(share).toEqual(expectedShares[x as 1 | 2 | 3]);
      }
    });
  });

  describe('Recovery from frozen shares', () => {
    it('should recover from shares {1, 2}', async () => {
      const result = await recoverAndValidate(
        [expectedShares[1], expectedShares[2]],
        12
      );
      expect(result.success).toBe(true);
      expect(result.recoveredMnemonic).toBe(testMnemonic);
    });

    it('should recover from shares {1, 3}', async () => {
      const result = await recoverAndValidate(
        [expectedShares[1], expectedShares[3]],
        12
      );
      expect(result.success).toBe(true);
      expect(result.recoveredMnemonic).toBe(testMnemonic);
    });

    it('should recover from shares {2, 3}', async () => {
      const result = await recoverAndValidate(
        [expectedShares[2], expectedShares[3]],
        12
      );
      expect(result.success).toBe(true);
      expect(result.recoveredMnemonic).toBe(testMnemonic);
    });

    it('should recover from all 3 shares', async () => {
      const result = await recoverAndValidate(
        [expectedShares[1], expectedShares[2], expectedShares[3]],
        12
      );
      expect(result.success).toBe(true);
      expect(result.recoveredMnemonic).toBe(testMnemonic);
    });
  });

  describe('Printed GIC identities on Share 1', () => {
    it('words + R + 60 + X and rows + 60 + X and cols + R + X', () => {
      const share = expectedShares[1];
      const wordSum = share.wordShares.reduce((a, b) => (a + b) % 2053, 0);
      const rowSum = share.checksumShares.reduce((a, b) => (a + b) % 2053, 0);
      const colSum = share.columnChecksumShares.reduce(
        (a, b) => (a + b) % 2053,
        0
      );
      const R = 10;
      const X = 1;
      expect((wordSum + R + 60 + X) % 2053).toBe(900);
      expect((rowSum + 60 + X) % 2053).toBe(900);
      expect((colSum + R + X) % 2053).toBe(900);
      expect(share.globalIntegrityCheckShare).toBe(900);
    });
  });
});

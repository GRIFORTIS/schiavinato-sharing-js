/**
 * Tests for DuraShare checksum functions (protocol v0.5.0)
 */

import { describe, it, expect } from 'vitest';
import {
  computeRowChecks,
  computeColumnChecks,
  computeGlobalIntegrityCheck,
  computeRowTotal
} from '../src/durashare/checksums';

describe('DuraShare Checksums', () => {
  // Frozen v0.5.0 vector indices
  const testWordIndices = [1680, 1471, 217, 42, 1338, 279, 1907, 324, 468, 682, 1844, 126];

  describe('computeRowChecks', () => {
    it('should compute position-bound row checksums for v0.5.0 vector', () => {
      const checksums = computeRowChecks(testWordIndices);
      // r1..r4 = sum(words) + rowNumber
      expect(checksums).toEqual([1316, 1661, 649, 603]);
    });

    it('should handle 24-word mnemonic (8 rows)', () => {
      const words24 = [...testWordIndices, ...testWordIndices];
      const checksums = computeRowChecks(words24);
      expect(checksums).toHaveLength(8);
    });

    it('should compute correct row count', () => {
      expect(computeRowChecks(testWordIndices)).toHaveLength(4);
      expect(computeRowChecks([...testWordIndices, ...testWordIndices])).toHaveLength(8);
    });
  });

  describe('computeColumnChecks', () => {
    it('should compute column checksums with tags 10/20/30', () => {
      expect(computeColumnChecks(testWordIndices)).toEqual([215, 891, 1120]);
    });
  });

  describe('computeGlobalIntegrityCheck', () => {
    it('should compute unbound GIC for v0.5.0 vector', () => {
      // unbound = Σwords + rowTotal(10) + 60 = 183
      expect(computeGlobalIntegrityCheck(testWordIndices)).toBe(183);
    });

    it('should include row and column totals', () => {
      const rowCount = 4;
      expect(computeRowTotal(rowCount)).toBe(10);
    });
  });

  describe('checksum integration', () => {
    it('should maintain GIC identity: words+R+60 ≡ rows+60 ≡ cols+R', () => {
      const rowChecks = computeRowChecks(testWordIndices);
      const colChecks = computeColumnChecks(testWordIndices);
      const unbound = computeGlobalIntegrityCheck(testWordIndices);
      const rowTotal = computeRowTotal(4);

      const sumRows =
        rowChecks.reduce((acc, val) => (acc + val) % 2053, 0);
      const sumCols =
        colChecks.reduce((acc, val) => (acc + val) % 2053, 0);
      const wordSum = testWordIndices.reduce((acc, val) => (acc + val) % 2053, 0);

      expect((sumRows + 60) % 2053).toBe(unbound);
      expect((sumCols + rowTotal) % 2053).toBe(unbound);
      expect((wordSum + rowTotal + 60) % 2053).toBe(unbound);
    });
  });
});

/**
 * Tests for Schiavinato checksum functions
 */

import { describe, it, expect } from 'vitest';
import { computeRowChecks, computeMasterCheck } from '../src/schiavinato/checksums';

describe('Schiavinato Checksums', () => {
  // Test vector from TEST_VECTORS.md
  const testWordIndices = [1679, 1470, 216, 41, 1337, 278, 1906, 323, 467, 681, 1843, 125];
  
  describe('computeRowChecks', () => {
    it('should compute row checksums for test vector', () => {
      const checksums = computeRowChecks(testWordIndices);
      
      // From TEST_VECTORS.md:
      // c1 = (1679 + 1470 + 216) mod 2053 = 1312
      // c2 = (41 + 1337 + 278) mod 2053 = 1656
      // c3 = (1906 + 323 + 467) mod 2053 = 643
      // c4 = (681 + 1843 + 125) mod 2053 = 596
      expect(checksums).toEqual([1312, 1656, 643, 596]);
    });

    it('should handle 24-word mnemonic (8 rows)', () => {
      const words24 = [
        ...testWordIndices,
        ...testWordIndices
      ];
      
      const checksums = computeRowChecks(words24);
      expect(checksums).toHaveLength(8);
    });

    it('should compute correct row count', () => {
      const words12 = testWordIndices;
      const checksums12 = computeRowChecks(words12);
      expect(checksums12).toHaveLength(4); // 12 / 3 = 4 rows

      const words24 = [...words12, ...words12];
      const checksums24 = computeRowChecks(words24);
      expect(checksums24).toHaveLength(8); // 24 / 3 = 8 rows
    });
  });

  describe('computeMasterCheck', () => {
    it('should compute master checksum for test vector', () => {
      const master = computeMasterCheck(testWordIndices);
      
      // From TEST_VECTORS.md: M = 101
      expect(master).toBe(101);
    });

    it('should handle empty array', () => {
      const master = computeMasterCheck([]);
      expect(master).toBe(0);
    });

    it('should handle single value', () => {
      const master = computeMasterCheck([100]);
      expect(master).toBe(100);
    });

    it('should handle values that sum over field prime', () => {
      const master = computeMasterCheck([2000, 2000, 2000]);
      // 6000 mod 2053 = 1894
      expect(master).toBe(1894);
    });
  });

  describe('checksum integration', () => {
    it('should maintain relationship between row and master checks', () => {
      const rowChecks = computeRowChecks(testWordIndices);
      const masterCheck = computeMasterCheck(testWordIndices);
      
      // Master check should equal sum of row checks (in GF(2053))
      const sumOfRows = rowChecks.reduce((acc, val) => (acc + val) % 2053, 0);
      expect(sumOfRows).toBe(masterCheck);
    });
  });
});


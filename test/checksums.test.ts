/**
 * Tests for Schiavinato checksum functions
 */

import { describe, it, expect } from 'vitest';
import { computeRowChecks, computeGlobalIntegrityCheck } from '../src/schiavinato/checksums';

describe('Schiavinato Checksums', () => {
  // Test vector from TEST_VECTORS.md (1-based indices)
  const testWordIndices = [1680, 1471, 217, 42, 1338, 279, 1907, 324, 468, 682, 1844, 126];
  
  describe('computeRowChecks', () => {
    it('should compute row checksums for test vector', () => {
      const checksums = computeRowChecks(testWordIndices);
      
      // From TEST_VECTORS.md:
      // c1 = (1680 + 1471 + 217) mod 2053 = 1315
      // c2 = (42 + 1338 + 279) mod 2053 = 1659
      // c3 = (1907 + 324 + 468) mod 2053 = 646
      // c4 = (682 + 1844 + 126) mod 2053 = 599
      expect(checksums).toEqual([1315, 1659, 646, 599]);
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

  describe('computeGlobalIntegrityCheck', () => {
    it('should compute Global Integrity Check (GIC) for test vector', () => {
      const globalChecksum = computeGlobalIntegrityCheck(testWordIndices);
      
      // From TEST_VECTORS.md: G = 113
      expect(globalChecksum).toBe(113);
    });

    it('should handle empty array', () => {
      const globalChecksum = computeGlobalIntegrityCheck([]);
      expect(globalChecksum).toBe(0);
    });

    it('should handle single value', () => {
      const globalChecksum = computeGlobalIntegrityCheck([100]);
      expect(globalChecksum).toBe(100);
    });

    it('should handle values that sum over field prime', () => {
      const globalChecksum = computeGlobalIntegrityCheck([2000, 2000, 2000]);
      // 6000 mod 2053 = 1894
      expect(globalChecksum).toBe(1894);
    });
  });

  describe('checksum integration', () => {
    it('should maintain relationship between row and global checks', () => {
      const rowChecks = computeRowChecks(testWordIndices);
      const globalCheck = computeGlobalIntegrityCheck(testWordIndices);
      
      // Global check should equal sum of row checks (in GF(2053))
      const sumOfRows = rowChecks.reduce((acc, val) => (acc + val) % 2053, 0);
      expect(sumOfRows).toBe(globalCheck);
    });
  });
});


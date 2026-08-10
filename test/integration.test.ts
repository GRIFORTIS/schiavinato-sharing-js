/**
 * Integration tests using TEST_VECTORS.md
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { splitBip39, recoverAndValidate } from '../src/index';

describe('Integration Tests - TEST_VECTORS.md', () => {
  const testMnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';
  
  // Expected shares from frozen v0.5.0 vectors (2-of-3 with known coefficients)
  const expectedTestVectorShares = {
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

  describe('Round-trip: Split and Recover', () => {
    it('should split and recover the test mnemonic', async () => {
      const { shares } = await splitBip39(testMnemonic, 2, 3);
      
      expect(shares).toHaveLength(3);
      
      // Use shares 1 and 2 to recover
      const result = await recoverAndValidate([shares[0], shares[1]], 12);
      
      expect(result.success).toBe(true);
      expect(result.recoveredMnemonic).toBe(testMnemonic);
      expect(result.errors.row).toHaveLength(0);
      expect(result.errors.global).toBe(false);
      expect(result.errors.bip39).toBe(false);
    });

    it('should work with any 2 of 3 shares', async () => {
      const { shares } = await splitBip39(testMnemonic, 2, 3);
      
      // Test all combinations
      const combinations = [
        [0, 1], // shares 1 and 2
        [0, 2], // shares 1 and 3
        [1, 2]  // shares 2 and 3
      ];
      
      for (const [i, j] of combinations) {
        const result = await recoverAndValidate([shares[i], shares[j]], 12);
        expect(result.success).toBe(true);
        expect(result.recoveredMnemonic).toBe(testMnemonic);
      }
    });

    it('should work with all 3 shares (overdetermined)', async () => {
      const { shares } = await splitBip39(testMnemonic, 2, 3);
      
      const result = await recoverAndValidate(shares, 12);
      
      expect(result.success).toBe(true);
      expect(result.recoveredMnemonic).toBe(testMnemonic);
    });
  });

  describe('Recovery with test vector shares', () => {
    it('should recover from shares {1, 2}', async () => {
      const result = await recoverAndValidate(
        [expectedTestVectorShares[1], expectedTestVectorShares[2]],
        12
      );
      
      expect(result.success).toBe(true);
      expect(result.recoveredMnemonic).toBe(testMnemonic);
    });

    it('should recover from shares {1, 3}', async () => {
      const result = await recoverAndValidate(
        [expectedTestVectorShares[1], expectedTestVectorShares[3]],
        12
      );
      
      expect(result.success).toBe(true);
      expect(result.recoveredMnemonic).toBe(testMnemonic);
    });

    it('should recover from shares {2, 3}', async () => {
      const result = await recoverAndValidate(
        [expectedTestVectorShares[2], expectedTestVectorShares[3]],
        12
      );
      
      expect(result.success).toBe(true);
      expect(result.recoveredMnemonic).toBe(testMnemonic);
    });

    it('should recover from all 3 shares', async () => {
      const result = await recoverAndValidate(
        [expectedTestVectorShares[1], expectedTestVectorShares[2], expectedTestVectorShares[3]],
        12
      );
      
      expect(result.success).toBe(true);
      expect(result.recoveredMnemonic).toBe(testMnemonic);
    });
  });

  describe('Error detection', () => {
    it('should detect corrupted word share', async () => {
      const corruptedShare = {
        ...expectedTestVectorShares[1],
        wordShares: [...expectedTestVectorShares[1].wordShares]
      };
      corruptedShare.wordShares[0] = 999; // Corrupt first word
      
      const result = await recoverAndValidate(
        [corruptedShare, expectedTestVectorShares[2]],
        12
      );
      
      expect(result.success).toBe(false);
      // v0.5.0 preflight audit reports via shareValidation
      const hasError =
        result.errors.row.length > 0 ||
        result.errors.global ||
        result.errors.bip39 ||
        result.errors.shareValidation !== null;
      expect(hasError).toBe(true);
    });

    it('should fail with insufficient shares', async () => {
      const result = await recoverAndValidate([expectedTestVectorShares[1]], 12);
      
      expect(result.success).toBe(false);
      expect(result.errors.generic).toContain('At least two shares');
    });

    it('should fail with duplicate share numbers', async () => {
      const result = await recoverAndValidate(
        [expectedTestVectorShares[1], expectedTestVectorShares[1]],
        12
      );
      
      expect(result.success).toBe(false);
      expect(result.errors.generic).toContain('Duplicate share numbers');
    });
  });

  describe('Different threshold schemes', () => {
    it('should work with 3-of-5 scheme', async () => {
      const { shares } = await splitBip39(testMnemonic, 3, 5);
      
      expect(shares).toHaveLength(5);
      
      // Use any 3 shares
      const result = await recoverAndValidate([shares[0], shares[2], shares[4]], 12);
      
      expect(result.success).toBe(true);
      expect(result.recoveredMnemonic).toBe(testMnemonic);
    });

    it('should work with 2-of-2 scheme', async () => {
      const { shares } = await splitBip39(testMnemonic, 2, 2);
      
      expect(shares).toHaveLength(2);
      
      const result = await recoverAndValidate(shares, 12);
      
      expect(result.success).toBe(true);
      expect(result.recoveredMnemonic).toBe(testMnemonic);
    });
  });

  describe('24-word mnemonics', () => {
    const mnemonic24 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art';

    it('should split and recover 24-word mnemonic', async () => {
      const { shares } = await splitBip39(mnemonic24, 2, 3);
      
      expect(shares).toHaveLength(3);
      expect(shares[0].wordShares).toHaveLength(24);
      expect(shares[0].checksumShares).toHaveLength(8); // 24 / 3 = 8 rows
      
      const result = await recoverAndValidate([shares[0], shares[1]], 24);
      
      expect(result.success).toBe(true);
      expect(result.recoveredMnemonic).toBe(mnemonic24);
    });
  });
});


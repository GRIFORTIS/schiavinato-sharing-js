/**
 * Integration tests using TEST_VECTORS.md
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { splitMnemonic, recoverMnemonic } from '../src/index';

describe('Integration Tests - TEST_VECTORS.md', () => {
  const testMnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';
  
  // Expected shares from TEST_VECTORS.md
  const expectedShares = {
    1: {
      shareNumber: 1,
      wordShares: [82, 1572, 1342, 1044, 198, 849, 272, 679, 142, 811, 1965, 508],
      checksumShares: [154, 555, 751, 1410],
      globalChecksumVerificationShare: 1819
    },
    2: {
      shareNumber: 2,
      wordShares: [538, 1674, 415, 2047, 1112, 1420, 691, 1035, 1870, 941, 34, 891],
      checksumShares: [1049, 1507, 859, 171],
      globalChecksumVerificationShare: 1484
    },
    3: {
      shareNumber: 3,
      wordShares: [994, 1776, 1541, 997, 2026, 1991, 1110, 1391, 1545, 1071, 156, 1274],
      checksumShares: [1944, 406, 967, 985],
      globalChecksumVerificationShare: 1149
    }
  };

  describe('Round-trip: Split and Recover', () => {
    it('should split and recover the test mnemonic', async () => {
      const shares = await splitMnemonic(testMnemonic, 2, 3);
      
      expect(shares).toHaveLength(3);
      
      // Use shares 1 and 2 to recover
      const result = await recoverMnemonic([shares[0], shares[1]], 12);
      
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(testMnemonic);
      expect(result.errors.row).toHaveLength(0);
      expect(result.errors.global).toBe(false);
      expect(result.errors.bip39).toBe(false);
    });

    it('should work with any 2 of 3 shares', async () => {
      const shares = await splitMnemonic(testMnemonic, 2, 3);
      
      // Test all combinations
      const combinations = [
        [0, 1], // shares 1 and 2
        [0, 2], // shares 1 and 3
        [1, 2]  // shares 2 and 3
      ];
      
      for (const [i, j] of combinations) {
        const result = await recoverMnemonic([shares[i], shares[j]], 12);
        expect(result.success).toBe(true);
        expect(result.mnemonic).toBe(testMnemonic);
      }
    });

    it('should work with all 3 shares (overdetermined)', async () => {
      const shares = await splitMnemonic(testMnemonic, 2, 3);
      
      const result = await recoverMnemonic(shares, 12);
      
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(testMnemonic);
    });
  });

  describe('Recovery with test vector shares', () => {
    it('should recover from shares {1, 2}', async () => {
      const result = await recoverMnemonic(
        [expectedShares[1], expectedShares[2]],
        12
      );
      
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(testMnemonic);
    });

    it('should recover from shares {1, 3}', async () => {
      const result = await recoverMnemonic(
        [expectedShares[1], expectedShares[3]],
        12
      );
      
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(testMnemonic);
    });

    it('should recover from shares {2, 3}', async () => {
      const result = await recoverMnemonic(
        [expectedShares[2], expectedShares[3]],
        12
      );
      
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(testMnemonic);
    });

    it('should recover from all 3 shares', async () => {
      const result = await recoverMnemonic(
        [expectedShares[1], expectedShares[2], expectedShares[3]],
        12
      );
      
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(testMnemonic);
    });
  });

  describe('Error detection', () => {
    it('should detect corrupted word share', async () => {
      const corruptedShare = {
        ...expectedShares[1],
        wordShares: [...expectedShares[1].wordShares]
      };
      corruptedShare.wordShares[0] = 999; // Corrupt first word
      
      const result = await recoverMnemonic(
        [corruptedShare, expectedShares[2]],
        12
      );
      
      expect(result.success).toBe(false);
      // Should detect error (either row checksum, global, or BIP39)
      const hasError = result.errors.row.length > 0 || 
                      result.errors.global || 
                      result.errors.bip39;
      expect(hasError).toBe(true);
    });

    it('should fail with insufficient shares', async () => {
      const result = await recoverMnemonic([expectedShares[1]], 12);
      
      expect(result.success).toBe(false);
      expect(result.errors.generic).toContain('At least two shares');
    });

    it('should fail with duplicate share numbers', async () => {
      const result = await recoverMnemonic(
        [expectedShares[1], expectedShares[1]],
        12
      );
      
      expect(result.success).toBe(false);
      expect(result.errors.generic).toContain('Duplicate share numbers');
    });
  });

  describe('Different threshold schemes', () => {
    it('should work with 3-of-5 scheme', async () => {
      const shares = await splitMnemonic(testMnemonic, 3, 5);
      
      expect(shares).toHaveLength(5);
      
      // Use any 3 shares
      const result = await recoverMnemonic([shares[0], shares[2], shares[4]], 12);
      
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(testMnemonic);
    });

    it('should work with 2-of-2 scheme', async () => {
      const shares = await splitMnemonic(testMnemonic, 2, 2);
      
      expect(shares).toHaveLength(2);
      
      const result = await recoverMnemonic(shares, 12);
      
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(testMnemonic);
    });
  });

  describe('24-word mnemonics', () => {
    const mnemonic24 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art';

    it('should split and recover 24-word mnemonic', async () => {
      const shares = await splitMnemonic(mnemonic24, 2, 3);
      
      expect(shares).toHaveLength(3);
      expect(shares[0].wordShares).toHaveLength(24);
      expect(shares[0].checksumShares).toHaveLength(8); // 24 / 3 = 8 rows
      
      const result = await recoverMnemonic([shares[0], shares[1]], 24);
      
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(mnemonic24);
    });
  });
});


/**
 * Comprehensive Threshold Scheme Tests
 * 
 * Tests all required scenarios with complete share combination coverage:
 * - 12-word seeds: 2-of-3, 2-of-4, 3-of-5
 * - 24-word seeds: 2-of-3, 2-of-4, 3-of-5
 * 
 * Each test:
 * 1. Creates ONE random seed
 * 2. Splits it ONCE
 * 3. Tests ALL possible k-share combinations
 * 4. Validates BIP39 checksum, row checksums, and GIC for each recovery
 * 
 * This ensures the scheme works correctly for all valid share combinations.
 */

import { describe, it, expect } from 'vitest';
import { splitMnemonic, recoverMnemonic, generateValidMnemonic } from '../src/index';

/**
 * Helper to generate all k-combinations from n items
 */
function getCombinations(n: number, k: number): number[][] {
  const result: number[][] = [];
  
  function combine(start: number, chosen: number[]) {
    if (chosen.length === k) {
      result.push([...chosen]);
      return;
    }
    
    for (let i = start; i < n; i++) {
      chosen.push(i);
      combine(i + 1, chosen);
      chosen.pop();
    }
  }
  
  combine(0, []);
  return result;
}

describe('Comprehensive Threshold Schemes - 12-word seeds', () => {
  describe('2-of-3 scheme (all 3 combinations)', () => {
    it('should recover from any 2 of 3 shares', async () => {
      // Generate ONE random 12-word seed
      const mnemonic = await generateValidMnemonic(12);
      
      // Split ONCE into 2-of-3 shares
      const shares = await splitMnemonic(mnemonic, 2, 3);
      expect(shares).toHaveLength(3);
      
      // Test ALL 3 combinations: C(3,2) = 3
      const combinations = getCombinations(3, 2);
      expect(combinations).toHaveLength(3);
      
      for (const combo of combinations) {
        const selectedShares = combo.map(i => shares[i]);
        const result = await recoverMnemonic(selectedShares, 12);
        
        // Full validation
        expect(result.success).toBe(true);
        expect(result.mnemonic).toBe(mnemonic);
        expect(result.errors.row).toHaveLength(0);
        expect(result.errors.global).toBe(false);
        expect(result.errors.bip39).toBe(false);
      }
    });
  });

  describe('2-of-4 scheme (all 6 combinations)', () => {
    it('should recover from any 2 of 4 shares', async () => {
      // Generate ONE random 12-word seed
      const mnemonic = await generateValidMnemonic(12);
      
      // Split ONCE into 2-of-4 shares
      const shares = await splitMnemonic(mnemonic, 2, 4);
      expect(shares).toHaveLength(4);
      
      // Test ALL 6 combinations: C(4,2) = 6
      const combinations = getCombinations(4, 2);
      expect(combinations).toHaveLength(6);
      
      for (const combo of combinations) {
        const selectedShares = combo.map(i => shares[i]);
        const result = await recoverMnemonic(selectedShares, 12);
        
        // Full validation
        expect(result.success).toBe(true);
        expect(result.mnemonic).toBe(mnemonic);
        expect(result.errors.row).toHaveLength(0);
        expect(result.errors.global).toBe(false);
        expect(result.errors.bip39).toBe(false);
      }
    });
  });

  describe('3-of-5 scheme (all 10 combinations)', () => {
    it('should recover from any 3 of 5 shares', async () => {
      // Generate ONE random 12-word seed
      const mnemonic = await generateValidMnemonic(12);
      
      // Split ONCE into 3-of-5 shares
      const shares = await splitMnemonic(mnemonic, 3, 5);
      expect(shares).toHaveLength(5);
      
      // Test ALL 10 combinations: C(5,3) = 10
      const combinations = getCombinations(5, 3);
      expect(combinations).toHaveLength(10);
      
      for (const combo of combinations) {
        const selectedShares = combo.map(i => shares[i]);
        const result = await recoverMnemonic(selectedShares, 12);
        
        // Full validation
        expect(result.success).toBe(true);
        expect(result.mnemonic).toBe(mnemonic);
        expect(result.errors.row).toHaveLength(0);
        expect(result.errors.global).toBe(false);
        expect(result.errors.bip39).toBe(false);
      }
    });
  });
});

describe('Comprehensive Threshold Schemes - 24-word seeds', () => {
  describe('2-of-3 scheme (all 3 combinations)', () => {
    it('should recover from any 2 of 3 shares', async () => {
      // Generate ONE random 24-word seed
      const mnemonic = await generateValidMnemonic(24);
      
      // Split ONCE into 2-of-3 shares
      const shares = await splitMnemonic(mnemonic, 2, 3);
      expect(shares).toHaveLength(3);
      expect(shares[0].wordShares).toHaveLength(24);
      expect(shares[0].checksumShares).toHaveLength(8); // 24 / 3 = 8 rows
      
      // Test ALL 3 combinations: C(3,2) = 3
      const combinations = getCombinations(3, 2);
      expect(combinations).toHaveLength(3);
      
      for (const combo of combinations) {
        const selectedShares = combo.map(i => shares[i]);
        const result = await recoverMnemonic(selectedShares, 24);
        
        // Full validation
        expect(result.success).toBe(true);
        expect(result.mnemonic).toBe(mnemonic);
        expect(result.errors.row).toHaveLength(0);
        expect(result.errors.global).toBe(false);
        expect(result.errors.bip39).toBe(false);
      }
    });
  });

  describe('2-of-4 scheme (all 6 combinations)', () => {
    it('should recover from any 2 of 4 shares', async () => {
      // Generate ONE random 24-word seed
      const mnemonic = await generateValidMnemonic(24);
      
      // Split ONCE into 2-of-4 shares
      const shares = await splitMnemonic(mnemonic, 2, 4);
      expect(shares).toHaveLength(4);
      expect(shares[0].wordShares).toHaveLength(24);
      expect(shares[0].checksumShares).toHaveLength(8);
      
      // Test ALL 6 combinations: C(4,2) = 6
      const combinations = getCombinations(4, 2);
      expect(combinations).toHaveLength(6);
      
      for (const combo of combinations) {
        const selectedShares = combo.map(i => shares[i]);
        const result = await recoverMnemonic(selectedShares, 24);
        
        // Full validation
        expect(result.success).toBe(true);
        expect(result.mnemonic).toBe(mnemonic);
        expect(result.errors.row).toHaveLength(0);
        expect(result.errors.global).toBe(false);
        expect(result.errors.bip39).toBe(false);
      }
    });
  });

  describe('3-of-5 scheme (all 10 combinations)', () => {
    it('should recover from any 3 of 5 shares', async () => {
      // Generate ONE random 24-word seed
      const mnemonic = await generateValidMnemonic(24);
      
      // Split ONCE into 3-of-5 shares
      const shares = await splitMnemonic(mnemonic, 3, 5);
      expect(shares).toHaveLength(5);
      expect(shares[0].wordShares).toHaveLength(24);
      expect(shares[0].checksumShares).toHaveLength(8);
      
      // Test ALL 10 combinations: C(5,3) = 10
      const combinations = getCombinations(5, 3);
      expect(combinations).toHaveLength(10);
      
      for (const combo of combinations) {
        const selectedShares = combo.map(i => shares[i]);
        const result = await recoverMnemonic(selectedShares, 24);
        
        // Full validation
        expect(result.success).toBe(true);
        expect(result.mnemonic).toBe(mnemonic);
        expect(result.errors.row).toHaveLength(0);
        expect(result.errors.global).toBe(false);
        expect(result.errors.bip39).toBe(false);
      }
    });
  });
});

describe('Edge Cases and Validation', () => {
  describe('Share structure validation', () => {
    it('should generate correct structure for 12-word 2-of-3', async () => {
      const mnemonic = await generateValidMnemonic(12);
      const shares = await splitMnemonic(mnemonic, 2, 3);
      
      for (const share of shares) {
        expect(share.wordShares).toHaveLength(12);
        expect(share.checksumShares).toHaveLength(4); // 12 / 3 = 4 rows
        expect(share.globalIntegrityCheckShare).toBeGreaterThanOrEqual(0);
        expect(share.globalIntegrityCheckShare).toBeLessThan(2053);
        expect(share.shareNumber).toBeGreaterThan(0);
      }
    });

    it('should generate correct structure for 24-word 3-of-5', async () => {
      const mnemonic = await generateValidMnemonic(24);
      const shares = await splitMnemonic(mnemonic, 3, 5);
      
      for (const share of shares) {
        expect(share.wordShares).toHaveLength(24);
        expect(share.checksumShares).toHaveLength(8); // 24 / 3 = 8 rows
        expect(share.globalIntegrityCheckShare).toBeGreaterThanOrEqual(0);
        expect(share.globalIntegrityCheckShare).toBeLessThan(2053);
        expect(share.shareNumber).toBeGreaterThan(0);
      }
    });
  });

  describe('Insufficient shares', () => {
    it('should fail to recover with k-1 shares for 2-of-3', async () => {
      const mnemonic = await generateValidMnemonic(12);
      const shares = await splitMnemonic(mnemonic, 2, 3);
      
      // Try with only 1 share (need 2)
      const result = await recoverMnemonic([shares[0]], 12);
      expect(result.success).toBe(false);
    });

    it('should fail to recover with k-1 shares for 3-of-5', async () => {
      const mnemonic = await generateValidMnemonic(12);
      const shares = await splitMnemonic(mnemonic, 3, 5);
      
      // Try with only 2 shares (need 3)
      const result = await recoverMnemonic([shares[0], shares[1]], 12);
      expect(result.success).toBe(false);
    });
  });

  describe('Overdetermined recovery (more than k shares)', () => {
    it('should recover with all n shares for 2-of-3', async () => {
      const mnemonic = await generateValidMnemonic(12);
      const shares = await splitMnemonic(mnemonic, 2, 3);
      
      // Use all 3 shares (only need 2)
      const result = await recoverMnemonic(shares, 12);
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(mnemonic);
    });

    it('should recover with all n shares for 3-of-5', async () => {
      const mnemonic = await generateValidMnemonic(12);
      const shares = await splitMnemonic(mnemonic, 3, 5);
      
      // Use all 5 shares (only need 3)
      const result = await recoverMnemonic(shares, 12);
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(mnemonic);
    });

    it('should recover with k+1 shares for 3-of-5', async () => {
      const mnemonic = await generateValidMnemonic(12);
      const shares = await splitMnemonic(mnemonic, 3, 5);
      
      // Use 4 shares (only need 3)
      const result = await recoverMnemonic([shares[0], shares[1], shares[2], shares[3]], 12);
      expect(result.success).toBe(true);
      expect(result.mnemonic).toBe(mnemonic);
    });
  });
});

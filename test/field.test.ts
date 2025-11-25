/**
 * Tests for GF(2053) field arithmetic
 */

import { describe, it, expect } from 'vitest';
import { mod, modAdd, modSub, modMul, modInv, FIELD_PRIME } from '../src/core/field';

describe('GF(2053) Field Arithmetic', () => {
  describe('mod', () => {
    it('should reduce positive values correctly', () => {
      expect(mod(0)).toBe(0);
      expect(mod(100)).toBe(100);
      expect(mod(2052)).toBe(2052);
      expect(mod(2053)).toBe(0);
      expect(mod(2054)).toBe(1);
      expect(mod(4106)).toBe(0);
    });

    it('should handle negative values with wraparound', () => {
      expect(mod(-1)).toBe(2052);
      expect(mod(-2053)).toBe(-0); // JavaScript % returns -0 for -2053 % 2053
      expect(mod(-100)).toBe(1953);
    });
  });

  describe('modAdd', () => {
    it('should add field elements correctly', () => {
      expect(modAdd(100, 200)).toBe(300);
      expect(modAdd(2000, 100)).toBe(47); // 2100 mod 2053 = 47
      expect(modAdd(1000, 1053)).toBe(0); // 2053 mod 2053 = 0
    });

    it('should handle zero correctly', () => {
      expect(modAdd(0, 0)).toBe(0);
      expect(modAdd(100, 0)).toBe(100);
      expect(modAdd(0, 100)).toBe(100);
    });
  });

  describe('modSub', () => {
    it('should subtract field elements correctly', () => {
      expect(modSub(200, 100)).toBe(100);
      expect(modSub(100, 200)).toBe(1953); // -100 mod 2053
      expect(modSub(0, 1)).toBe(2052);
    });

    it('should handle zero correctly', () => {
      expect(modSub(0, 0)).toBe(0);
      expect(modSub(100, 0)).toBe(100);
      expect(modSub(0, 100)).toBe(1953);
    });
  });

  describe('modMul', () => {
    it('should multiply field elements correctly', () => {
      expect(modMul(10, 20)).toBe(200);
      expect(modMul(100, 50)).toBe(894); // 5000 mod 2053 = 894
      expect(modMul(2, 1026)).toBe(2052);
    });

    it('should handle zero correctly', () => {
      expect(modMul(0, 0)).toBe(0);
      expect(modMul(100, 0)).toBe(0);
      expect(modMul(0, 100)).toBe(0);
    });

    it('should handle identity correctly', () => {
      expect(modMul(1, 100)).toBe(100);
      expect(modMul(100, 1)).toBe(100);
    });
  });

  describe('modInv', () => {
    it('should compute multiplicative inverse correctly', () => {
      // 2 * 1027 ≡ 1 (mod 2053)
      expect(modInv(2)).toBe(1027);
      expect(modMul(2, modInv(2))).toBe(1);

      // Test inverse of 1027
      expect(modInv(1027)).toBe(2);
      expect(modMul(1027, modInv(1027))).toBe(1);
    });

    it('should throw error for zero', () => {
      expect(() => modInv(0)).toThrow('Attempted to invert zero in GF(2053)');
    });

    it('should work for all non-zero field elements', () => {
      // Test a sample of values
      const testValues = [1, 2, 10, 100, 456, 1000, 2052];
      
      for (const value of testValues) {
        const inverse = modInv(value);
        expect(modMul(value, inverse)).toBe(1);
      }
    });
  });

  describe('field properties', () => {
    it('should verify field prime constant', () => {
      expect(FIELD_PRIME).toBe(2053);
    });

    it('should maintain closure under addition', () => {
      const a = 1500;
      const b = 800;
      const result = modAdd(a, b);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(FIELD_PRIME);
    });

    it('should maintain closure under multiplication', () => {
      const a = 1500;
      const b = 800;
      const result = modMul(a, b);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(FIELD_PRIME);
    });
  });
});


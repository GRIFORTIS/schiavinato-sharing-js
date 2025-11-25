/**
 * Security Utilities Tests
 * 
 * Tests for constant-time comparison and memory cleanup functionality
 */

import { describe, it, expect } from 'vitest';
import { 
  constantTimeEqual, 
  constantTimeStringEqual,
  secureWipeArray,
  secureWipeNumber 
} from '../src/utils/security.js';

describe('Security Utilities', () => {
  describe('constantTimeEqual', () => {
    it('should return true for equal values', () => {
      expect(constantTimeEqual(42, 42)).toBe(true);
      expect(constantTimeEqual(0, 0)).toBe(true);
      expect(constantTimeEqual(2052, 2052)).toBe(true);
      expect(constantTimeEqual(1234, 1234)).toBe(true);
    });

    it('should return false for different values', () => {
      expect(constantTimeEqual(42, 43)).toBe(false);
      expect(constantTimeEqual(0, 1)).toBe(false);
      expect(constantTimeEqual(2052, 2051)).toBe(false);
      expect(constantTimeEqual(1234, 4321)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(constantTimeEqual(-1, -1)).toBe(true);
      expect(constantTimeEqual(-1, 1)).toBe(false);
      expect(constantTimeEqual(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)).toBe(true);
    });

    it('should take constant time regardless of values (basic test)', () => {
      // This is a basic sanity check - true constant-time requires specialized tools
      const iterations = 10000;
      
      // Test equal values
      const startEqual = performance.now();
      for (let i = 0; i < iterations; i++) {
        constantTimeEqual(1234, 1234);
      }
      const timeEqual = performance.now() - startEqual;
      
      // Test unequal values (different in first bit)
      const startUnequal = performance.now();
      for (let i = 0; i < iterations; i++) {
        constantTimeEqual(1234, 1235);
      }
      const timeUnequal = performance.now() - startUnequal;
      
      // The times should be very close (within 50% margin for JS variability)
      const ratio = timeEqual / timeUnequal;
      expect(ratio).toBeGreaterThan(0.5);
      expect(ratio).toBeLessThan(2.0);
    });
  });

  describe('constantTimeStringEqual', () => {
    it('should return true for equal strings', () => {
      expect(constantTimeStringEqual('hello', 'hello')).toBe(true);
      expect(constantTimeStringEqual('', '')).toBe(true);
      expect(constantTimeStringEqual('0110110', '0110110')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(constantTimeStringEqual('hello', 'world')).toBe(false);
      expect(constantTimeStringEqual('0110110', '0110111')).toBe(false);
      expect(constantTimeStringEqual('abc', 'abcd')).toBe(false);
    });

    it('should handle different length strings', () => {
      expect(constantTimeStringEqual('short', 'longerstring')).toBe(false);
      expect(constantTimeStringEqual('', 'nonempty')).toBe(false);
    });

    it('should take constant time for same-length strings (basic test)', () => {
      const iterations = 10000;
      const str1 = '01101100110011001100110011001100';
      const str2Equal = '01101100110011001100110011001100';
      const str2DiffLast = '01101100110011001100110011001101'; // Different in last char
      
      // Test equal strings
      const startEqual = performance.now();
      for (let i = 0; i < iterations; i++) {
        constantTimeStringEqual(str1, str2Equal);
      }
      const timeEqual = performance.now() - startEqual;
      
      // Test unequal strings (different in last character)
      const startUnequal = performance.now();
      for (let i = 0; i < iterations; i++) {
        constantTimeStringEqual(str1, str2DiffLast);
      }
      const timeUnequal = performance.now() - startUnequal;
      
      // The times should be very close
      const ratio = timeEqual / timeUnequal;
      expect(ratio).toBeGreaterThan(0.5);
      expect(ratio).toBeLessThan(2.0);
    });
  });

  describe('secureWipeArray', () => {
    it('should overwrite all array elements with zeros', () => {
      const arr = [1, 2, 3, 4, 5];
      secureWipeArray(arr);
      expect(arr).toEqual([0, 0, 0, 0, 0]);
    });

    it('should handle empty arrays', () => {
      const arr: number[] = [];
      secureWipeArray(arr);
      expect(arr).toEqual([]);
    });

    it('should handle arrays with negative numbers', () => {
      const arr = [-1, -2, -3];
      secureWipeArray(arr);
      expect(arr).toEqual([0, 0, 0]);
    });

    it('should handle large numbers', () => {
      const arr = [999999, 888888, 777777];
      secureWipeArray(arr);
      expect(arr).toEqual([0, 0, 0]);
    });

    it('should handle arrays with mixed values', () => {
      const arr = [0, 1, -1, 1000, 2047, -2053];
      secureWipeArray(arr);
      expect(arr).toEqual([0, 0, 0, 0, 0, 0]);
    });
  });

  describe('secureWipeNumber', () => {
    it('should return 0', () => {
      expect(secureWipeNumber(42)).toBe(0);
      expect(secureWipeNumber(1234)).toBe(0);
      expect(secureWipeNumber(-1)).toBe(0);
      expect(secureWipeNumber(0)).toBe(0);
    });
  });

  describe('Integration: Memory cleanup in recovery flow', () => {
    it('should wipe sensitive data after use', () => {
      // Simulate a recovery scenario
      const sensitiveWords = [1679, 456, 892, 1234, 567, 890, 1111, 2222, 3333, 4444, 5555, 6666];
      const sensitiveChecks = [1500, 2000, 2500, 3000];
      let sensitiveMaster = 12345;

      // Verify data exists
      expect(sensitiveWords[0]).toBe(1679);
      expect(sensitiveChecks[0]).toBe(1500);
      expect(sensitiveMaster).toBe(12345);

      // Cleanup
      secureWipeArray(sensitiveWords);
      secureWipeArray(sensitiveChecks);
      sensitiveMaster = secureWipeNumber(sensitiveMaster);

      // Verify data is wiped
      expect(sensitiveWords).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      expect(sensitiveChecks).toEqual([0, 0, 0, 0]);
      expect(sensitiveMaster).toBe(0);
    });
  });

  describe('Integration: Constant-time validation', () => {
    it('should validate checksums in constant time', () => {
      const validChecksum = 1500;
      const recomputedValid = 1500;
      const recomputedInvalid = 1501;

      // Valid checksum
      expect(constantTimeEqual(validChecksum, recomputedValid)).toBe(true);

      // Invalid checksum
      expect(constantTimeEqual(validChecksum, recomputedInvalid)).toBe(false);
    });

    it('should validate master checksum in constant time', () => {
      const recoveredMaster = 12345;
      const recomputedValid = 12345;
      const recomputedInvalid = 12346;

      expect(constantTimeEqual(recoveredMaster, recomputedValid)).toBe(true);
      expect(constantTimeEqual(recoveredMaster, recomputedInvalid)).toBe(false);
    });

    it('should validate BIP39 checksums in constant time', () => {
      const derivedChecksum = '01101100';
      const checksumValid = '01101100';
      const checksumInvalid = '01101101';

      expect(constantTimeStringEqual(derivedChecksum, checksumValid)).toBe(true);
      expect(constantTimeStringEqual(derivedChecksum, checksumInvalid)).toBe(false);
    });
  });
});


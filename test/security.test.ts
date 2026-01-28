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
  secureWipeNumber,
  wipeString
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

    // Note: Constant-time property is guaranteed by design (single XOR operation with no
    // branching on secret data). Empirical timing tests in JavaScript are unreliable due
    // to JIT optimization, OS scheduling, and garbage collection. This matches Bitcoin
    // Core's approach: constant-time by construction, verified through code review.
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

    // Note: Constant-time property is guaranteed by design (fixed-length loop with no
    // early exit, OR accumulation with no branching on secret data). Empirical timing
    // tests in JavaScript are unreliable. This matches Bitcoin Core's approach:
    // constant-time by construction, verified through code review.
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
      const arr = [0, 1, -1, 1000, 2048, -2053];
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

  describe('wipeString', () => {
    it('should return a null-filled string of the same length', () => {
      const original = 'hello';
      const wiped = wipeString(original);
      expect(wiped).toBe('\0\0\0\0\0');
      expect(wiped.length).toBe(original.length);
    });

    it('should handle empty strings', () => {
      const wiped = wipeString('');
      expect(wiped).toBe('');
    });

    it('should handle long strings', () => {
      const original = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      const wiped = wipeString(original);
      expect(wiped.length).toBe(original.length);
      expect(wiped).toBe('\0'.repeat(original.length));
    });

    it('should handle strings with special characters', () => {
      const original = 'test@123!';
      const wiped = wipeString(original);
      expect(wiped.length).toBe(original.length);
      expect(wiped).toBe('\0\0\0\0\0\0\0\0\0');
    });

    it('should handle unicode strings', () => {
      const original = '日本語テスト';
      const wiped = wipeString(original);
      expect(wiped.length).toBe(original.length);
      expect(wiped).toBe('\0'.repeat(original.length));
    });

    it('should handle mnemonic strings', () => {
      const mnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';
      const wiped = wipeString(mnemonic);
      expect(wiped.length).toBe(mnemonic.length);
      // Verify it's all null bytes
      for (let i = 0; i < wiped.length; i++) {
        expect(wiped.charCodeAt(i)).toBe(0);
      }
    });

    it('should not affect the original string (strings are immutable)', () => {
      const original = 'sensitive data';
      const wiped = wipeString(original);
      
      // Original is unchanged (JS strings are immutable)
      expect(original).toBe('sensitive data');
      // But we get a new wiped string
      expect(wiped).toBe('\0\0\0\0\0\0\0\0\0\0\0\0\0\0');
      expect(wiped).not.toBe(original);
    });
  });

  describe('Integration: Memory cleanup in recovery flow', () => {
    it('should wipe sensitive data after use', () => {
      // Simulate a recovery scenario
      const sensitiveWords = [1679, 456, 892, 1234, 567, 890, 1111, 2222, 3333, 4444, 5555, 6666];
      const sensitiveChecks = [1500, 2000, 2500, 3000];
      let sensitiveGlobalChecksum = 12345;

      // Verify data exists
      expect(sensitiveWords[0]).toBe(1679);
      expect(sensitiveChecks[0]).toBe(1500);
      expect(sensitiveGlobalChecksum).toBe(12345);

      // Cleanup
      secureWipeArray(sensitiveWords);
      secureWipeArray(sensitiveChecks);
      sensitiveGlobalChecksum = secureWipeNumber(sensitiveGlobalChecksum);

      // Verify data is wiped
      expect(sensitiveWords).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      expect(sensitiveChecks).toEqual([0, 0, 0, 0]);
      expect(sensitiveGlobalChecksum).toBe(0);
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

    it('should validate Global Integrity Check (GIC) in constant time', () => {
      const recoveredGlobalIntegrityCheck = 12345;
      const recomputedValid = 12345;
      const recomputedInvalid = 12346;

      expect(constantTimeEqual(recoveredGlobalIntegrityCheck, recomputedValid)).toBe(true);
      expect(constantTimeEqual(recoveredGlobalIntegrityCheck, recomputedInvalid)).toBe(false);
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


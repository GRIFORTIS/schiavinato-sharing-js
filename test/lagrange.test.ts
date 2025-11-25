/**
 * Tests for Lagrange interpolation
 */

import { describe, it, expect } from 'vitest';
import { lagrangeInterpolateAtZero, computeLagrangeMultipliers } from '../src/core/lagrange';

describe('Lagrange Interpolation', () => {
  describe('lagrangeInterpolateAtZero', () => {
    it('should recover secret from 2 points', () => {
      // From TEST_VECTORS.md: word w1 with polynomial [1679, 456]
      // Share 1: (1, 82), Share 2: (2, 538)
      const points = [
        { x: 1, y: 82 },
        { x: 2, y: 538 }
      ];
      
      expect(lagrangeInterpolateAtZero(points)).toBe(1679);
    });

    it('should recover secret from 3 points (overdetermined)', () => {
      // Using all 3 shares for w1
      const points = [
        { x: 1, y: 82 },
        { x: 2, y: 538 },
        { x: 3, y: 994 }
      ];
      
      expect(lagrangeInterpolateAtZero(points)).toBe(1679);
    });

    it('should work with different point pairs', () => {
      const secret = 1679;
      
      // Shares 1 and 3
      expect(lagrangeInterpolateAtZero([
        { x: 1, y: 82 },
        { x: 3, y: 994 }
      ])).toBe(secret);
      
      // Shares 2 and 3
      expect(lagrangeInterpolateAtZero([
        { x: 2, y: 538 },
        { x: 3, y: 994 }
      ])).toBe(secret);
    });

    it('should recover all test vector secrets', () => {
      // Test all 12 word secrets from TEST_VECTORS.md
      const testCases = [
        { secret: 1679, shares: [[1, 82], [2, 538], [3, 994]] },
        { secret: 1470, shares: [[1, 1572], [2, 1674], [3, 1776]] },
        { secret: 216, shares: [[1, 1342], [2, 415], [3, 1541]] },
        { secret: 41, shares: [[1, 1044], [2, 2047], [3, 997]] },
        { secret: 1337, shares: [[1, 198], [2, 1112], [3, 2026]] },
        { secret: 278, shares: [[1, 849], [2, 1420], [3, 1991]] },
        { secret: 1906, shares: [[1, 272], [2, 691], [3, 1110]] },
        { secret: 323, shares: [[1, 679], [2, 1035], [3, 1391]] },
        { secret: 467, shares: [[1, 142], [2, 1870], [3, 1545]] },
        { secret: 681, shares: [[1, 811], [2, 941], [3, 1071]] },
        { secret: 1843, shares: [[1, 1965], [2, 34], [3, 156]] },
        { secret: 125, shares: [[1, 508], [2, 891], [3, 1274]] },
      ];

      for (const { secret, shares } of testCases) {
        const points = shares.slice(0, 2).map(([x, y]) => ({ x, y }));
        expect(lagrangeInterpolateAtZero(points)).toBe(secret);
      }
    });

    it('should throw on empty points array', () => {
      expect(() => lagrangeInterpolateAtZero([])).toThrow();
    });
  });

  describe('computeLagrangeMultipliers', () => {
    it('should compute multipliers for shares {1, 2}', () => {
      // From TEST_VECTORS.md: {1, 2} → (2, 2052)
      const multipliers = computeLagrangeMultipliers([1, 2]);
      expect(multipliers).toEqual([2, 2052]);
    });

    it('should compute multipliers for shares {1, 3}', () => {
      // From TEST_VECTORS.md: {1, 3} → (1028, 1026)
      const multipliers = computeLagrangeMultipliers([1, 3]);
      expect(multipliers).toEqual([1028, 1026]);
    });

    it('should compute multipliers for shares {2, 3}', () => {
      // From TEST_VECTORS.md: {2, 3} → (3, 2051)
      const multipliers = computeLagrangeMultipliers([2, 3]);
      expect(multipliers).toEqual([3, 2051]);
    });

    it('should allow manual recovery with multipliers', () => {
      // Test manual recovery: secret = γ₁·y₁ + γ₂·y₂ (mod 2053)
      const multipliers = computeLagrangeMultipliers([1, 2]);
      const y1 = 82;
      const y2 = 538;
      
      const recovered = (multipliers[0] * y1 + multipliers[1] * y2) % 2053;
      expect(recovered).toBe(1679);
    });

    it('should throw on insufficient share numbers', () => {
      expect(() => computeLagrangeMultipliers([1])).toThrow('At least two share numbers');
      expect(() => computeLagrangeMultipliers([])).toThrow('At least two share numbers');
    });

    it('should throw on duplicate share numbers', () => {
      expect(() => computeLagrangeMultipliers([1, 1])).toThrow('must be unique');
    });

    it('should throw on zero share number', () => {
      expect(() => computeLagrangeMultipliers([0, 1])).toThrow('cannot be zero');
    });
  });
});


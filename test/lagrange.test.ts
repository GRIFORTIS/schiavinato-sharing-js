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
        { secret: 1680, shares: [[1, 83], [2, 539], [3, 995]] },
        { secret: 1471, shares: [[1, 1573], [2, 1675], [3, 1777]] },
        { secret: 217, shares: [[1, 1343], [2, 416], [3, 1542]] },
        { secret: 42, shares: [[1, 1045], [2, 2048], [3, 998]] },
        { secret: 1338, shares: [[1, 199], [2, 1113], [3, 2027]] },
        { secret: 279, shares: [[1, 850], [2, 1421], [3, 1992]] },
        { secret: 1907, shares: [[1, 273], [2, 692], [3, 1111]] },
        { secret: 324, shares: [[1, 680], [2, 1036], [3, 1392]] },
        { secret: 468, shares: [[1, 143], [2, 1871], [3, 1546]] },
        { secret: 682, shares: [[1, 812], [2, 942], [3, 1072]] },
        { secret: 1844, shares: [[1, 1966], [2, 35], [3, 157]] },
        { secret: 126, shares: [[1, 509], [2, 892], [3, 1275]] },
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


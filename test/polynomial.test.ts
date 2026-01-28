/**
 * Tests for polynomial operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { randomPolynomial, evaluatePolynomial } from '../src/core/polynomial';
import { configureRandomSource } from '../src/utils/random';
import { FIELD_PRIME } from '../src/core/field';

describe('Polynomial Operations', () => {
  describe('randomPolynomial', () => {
    it('should create polynomial with correct structure', () => {
      const secret = 1679;
      const degree = 1;
      const poly = randomPolynomial(secret, degree);
      
      expect(poly).toHaveLength(degree + 1);
      expect(poly[0]).toBe(secret);
      expect(poly[1]).toBeGreaterThanOrEqual(0);
      expect(poly[1]).toBeLessThan(FIELD_PRIME);
    });

    it('should create degree-0 polynomial (constant)', () => {
      const secret = 100;
      const poly = randomPolynomial(secret, 0);
      
      expect(poly).toHaveLength(1);
      expect(poly[0]).toBe(secret);
    });

    it('should create degree-2 polynomial', () => {
      const secret = 1000;
      const degree = 2;
      const poly = randomPolynomial(secret, degree);
      
      expect(poly).toHaveLength(3);
      expect(poly[0]).toBe(secret);
    });

    it('should use deterministic random when configured', () => {
      // Configure deterministic random source
      let counter = 0;
      configureRandomSource({
        getRandomValues(array: Uint32Array) {
          for (let i = 0; i < array.length; i++) {
            array[i] = counter++ % FIELD_PRIME;
          }
        }
      });

      const poly1 = randomPolynomial(100, 1);
      
      // Reset counter
      counter = 0;
      configureRandomSource({
        getRandomValues(array: Uint32Array) {
          for (let i = 0; i < array.length; i++) {
            array[i] = counter++ % FIELD_PRIME;
          }
        }
      });

      const poly2 = randomPolynomial(100, 1);
      
      expect(poly1).toEqual(poly2);
    });
  });

  describe('evaluatePolynomial', () => {
    it('should evaluate constant polynomial', () => {
      const poly = [42];
      expect(evaluatePolynomial(poly, 0)).toBe(42);
      expect(evaluatePolynomial(poly, 1)).toBe(42);
      expect(evaluatePolynomial(poly, 100)).toBe(42);
    });

    it('should evaluate linear polynomial', () => {
      // f(x) = 1679 + 456x
      const poly = [1679, 456];
      
      // f(0) = 1679
      expect(evaluatePolynomial(poly, 0)).toBe(1679);
      
      // f(1) = 1679 + 456 = 2135 mod 2053 = 82
      expect(evaluatePolynomial(poly, 1)).toBe(82);
      
      // f(2) = 1679 + 912 = 2591 mod 2053 = 538
      expect(evaluatePolynomial(poly, 2)).toBe(538);
      
      // f(3) = 1679 + 1368 = 3047 mod 2053 = 994
      expect(evaluatePolynomial(poly, 3)).toBe(994);
    });

    it('should evaluate quadratic polynomial', () => {
      // f(x) = 10 + 5x + 3x²
      const poly = [10, 5, 3];
      
      // f(0) = 10
      expect(evaluatePolynomial(poly, 0)).toBe(10);
      
      // f(1) = 10 + 5 + 3 = 18
      expect(evaluatePolynomial(poly, 1)).toBe(18);
      
      // f(2) = 10 + 10 + 12 = 32
      expect(evaluatePolynomial(poly, 2)).toBe(32);
    });

    it('should handle all test vector polynomials correctly', () => {
      // From TEST_VECTORS.md - test all word polynomials
      const testPolynomials = [
        { poly: [1680, 456], x1: 83, x2: 539, x3: 995 },
        { poly: [1471, 102], x1: 1573, x2: 1675, x3: 1777 },
        { poly: [217, 1126], x1: 1343, x2: 416, x3: 1542 },
        { poly: [42, 1003], x1: 1045, x2: 2048, x3: 998 },
        { poly: [1338, 914], x1: 199, x2: 1113, x3: 2027 },
        { poly: [279, 571], x1: 850, x2: 1421, x3: 1992 },
      ];

      for (const { poly, x1, x2, x3 } of testPolynomials) {
        expect(evaluatePolynomial(poly, 1)).toBe(x1);
        expect(evaluatePolynomial(poly, 2)).toBe(x2);
        expect(evaluatePolynomial(poly, 3)).toBe(x3);
      }
    });
  });
});


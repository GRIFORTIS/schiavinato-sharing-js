/**
 * Polynomial Operations in GF(2053)
 * 
 * This module implements polynomial creation and evaluation for Shamir's Secret Sharing.
 */

import { mod, modAdd, modMul } from './field.js';
import { getRandomFieldElement } from '../utils/random.js';

/**
 * Builds a random polynomial of the requested degree whose constant term is the secret.
 * 
 * For a (k,n) threshold scheme, we need a polynomial of degree k-1:
 * f(x) = a₀ + a₁x + a₂x² + ... + aₖ₋₁xᵏ⁻¹
 * 
 * where a₀ = secret and a₁...aₖ₋₁ are random coefficients.
 * 
 * @param secret - The secret value to share (becomes the constant term)
 * @param degree - The degree of the polynomial (k-1 for k-threshold scheme)
 * @returns Array of coefficients [a₀, a₁, a₂, ..., aₖ₋₁]
 * 
 * @example
 * // For a 2-of-n scheme (degree 1):
 * randomPolynomial(1679, 1) // Returns [1679, randomValue]
 * 
 * // For a 3-of-n scheme (degree 2):
 * randomPolynomial(1679, 2) // Returns [1679, randomValue1, randomValue2]
 */
export function randomPolynomial(secret: number, degree: number): number[] {
  const coefficients = [mod(secret)];
  
  for (let i = 0; i < degree; i++) {
    coefficients.push(getRandomFieldElement());
  }
  
  return coefficients;
}

/**
 * Evaluates a polynomial at the provided x coordinate inside GF(2053).
 * Uses Horner's method for efficient evaluation.
 * 
 * For polynomial f(x) = a₀ + a₁x + a₂x² + ... + aₙxⁿ
 * Horner's form: f(x) = a₀ + x(a₁ + x(a₂ + ... + x(aₙ)))
 * 
 * @param coefficients - Array of polynomial coefficients [a₀, a₁, ..., aₙ]
 * @param x - The x coordinate at which to evaluate
 * @returns The polynomial value f(x) mod 2053
 * 
 * @example
 * // Evaluate f(x) = 1679 + 456x at x=1
 * evaluatePolynomial([1679, 456], 1) // Returns 2135 mod 2053 = 82
 * 
 * // Evaluate f(x) = 1679 + 456x at x=2
 * evaluatePolynomial([1679, 456], 2) // Returns 2591 mod 2053 = 538
 */
export function evaluatePolynomial(coefficients: number[], x: number): number {
  let result = 0;
  const fieldX = mod(x);
  
  // Horner's method: start from the highest degree coefficient
  for (let i = coefficients.length - 1; i >= 0; i--) {
    result = modAdd(modMul(result, fieldX), coefficients[i]);
  }
  
  return result;
}


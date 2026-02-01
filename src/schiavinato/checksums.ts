/**
 * Schiavinato Sharing Checksum Functions
 * 
 * This module implements the per-row checksums and Global Integrity Check (GIC) that are
 * unique to the Schiavinato Sharing scheme.
 * 
 * Introduced in v0.4.0: Implements dual-path checksum validation (Path A and Path B)
 * to detect bit flips and hardware faults.
 */

import { modAdd } from '../core/field.js';
import { WORDS_PER_ROW } from '../utils/validation.js';

/**
 * Computes the per-row checksum (sum of three words) for all word indices.
 * 
 * PATH A: Direct computation from word indices (or interpolated values).
 * 
 * For a mnemonic with N words arranged in rows of 3, computes N/3 checksums:
 * checksum[i] = (word[3i] + word[3i+1] + word[3i+2]) mod 2053
 * 
 * These row checksums provide error detection for individual rows and
 * can be used to identify which specific shares are corrupt during recovery.
 * 
 * @param wordIndices - Array of BIP39 word indices (1-2048)
 * @returns Array of row checksums in GF(2053)
 * 
 * @example
 * // For 12-word mnemonic with indices [1680, 1471, 217, 42, 1338, 279, ...]
 * computeRowChecks([1680, 1471, 217, 42, 1338, 279, 1907, 324, 468, 682, 1844, 126])
 * // Returns [1315, 1659, 646, 599]
 * // where 1315 = (1680 + 1471 + 217) mod 2053
 * //       1659 = (42 + 1338 + 279) mod 2053
 * //       646 = (1907 + 324 + 468) mod 2053
 * //       599 = (682 + 1844 + 126) mod 2053
 */
export function computeRowChecks(wordIndices: number[]): number[] {
  const rowCount = wordIndices.length / WORDS_PER_ROW;
  const checks: number[] = [];
  
  for (let row = 0; row < rowCount; row++) {
    const base = row * WORDS_PER_ROW;
    const sum = modAdd(
      modAdd(wordIndices[base], wordIndices[base + 1]), 
      wordIndices[base + 2]
    );
    checks.push(sum);
  }
  
  return checks;
}

/**
 * Calculates the Global Integrity Check (GIC) by summing all word indices mod 2053.
 * 
 * PATH A: Direct computation from word indices (or interpolated values).
 * 
 * This provides an overall integrity check that complements the per-row checksums.
 * During recovery, if row checksums pass but the GIC fails,
 * it indicates a more subtle corruption pattern.
 * 
 * @param wordIndices - Array of BIP39 word indices (1-2048)
 * @returns The Global Integrity Check (GIC) in GF(2053)
 * 
 * @example
 * // For 12-word mnemonic
 * computeGlobalIntegrityCheck([1680, 1471, 217, 42, 1338, 279, 1907, 324, 468, 682, 1844, 126])
 * // Returns 113
 * // where 113 = (1680 + 1471 + ... + 126) mod 2053
 */
export function computeGlobalIntegrityCheck(wordIndices: number[]): number {
  return wordIndices.reduce((acc, value) => modAdd(acc, value), 0);
}

/**
 * Sums polynomial coefficients modulo 2053 to create a checksum polynomial.
 * 
 * PATH B: Polynomial-based checksum computation.
 * 
 * Given multiple polynomials (e.g., word polynomials), computes a new polynomial
 * where each coefficient is the sum of corresponding coefficients from input polynomials.
 * This creates a "checksum polynomial" that, when evaluated at any point x, equals
 * the sum of the input polynomials evaluated at x.
 * 
 * Mathematical property:
 * If P₁(x), P₂(x), ..., Pₙ(x) are polynomials, then:
 * P_sum(x) = P₁(x) + P₂(x) + ... + Pₙ(x)
 * 
 * This is computed by summing coefficients: P_sum = [Σa₀, Σa₁, Σa₂, ...]
 * 
 * @param polynomials - Array of polynomial coefficient arrays to sum
 * @returns Polynomial with summed coefficients (same degree as inputs)
 * @throws {Error} If polynomials have different degrees
 * 
 * @example
 * // Sum two degree-1 polynomials: P₁(x) = 1680 + 456x, P₂(x) = 1471 + 789x
 * sumPolynomials([[1680, 456], [1471, 789]])
 * // Returns [1098, 1245] representing 1098 + 1245x (mod 2053)
 */
export function sumPolynomials(polynomials: number[][]): number[] {
  if (polynomials.length === 0) {
    throw new Error('Cannot sum zero polynomials');
  }
  
  const degree = polynomials[0].length;
  
  // Validate all polynomials have same degree
  for (let i = 1; i < polynomials.length; i++) {
    if (polynomials[i].length !== degree) {
      throw new Error(
        `Polynomial degree mismatch: expected ${degree - 1} but got ${polynomials[i].length - 1} at index ${i}`
      );
    }
  }
  
  // Sum coefficients at each position
  const result: number[] = new Array(degree).fill(0);
  for (const poly of polynomials) {
    for (let i = 0; i < degree; i++) {
      result[i] = modAdd(result[i], poly[i]);
    }
  }
  
  return result;
}

/**
 * Computes row checksum polynomials from word polynomials.
 * 
 * PATH B: Creates checksum polynomials by summing word polynomial coefficients.
 * 
 * For each row of 3 words, creates a checksum polynomial that is the sum
 * of the three word polynomials in that row. Evaluating this polynomial at
 * any share number x gives the same result as Path A (sum of word shares).
 * 
 * @param wordPolynomials - Array of word polynomials (one per word)
 * @returns Array of row checksum polynomials
 * 
 * @example
 * // For 12 words with degree-1 polynomials (k=2)
 * const wordPolys = [[1680, 456], [1471, 789], [217, 123], ...]
 * const rowPolys = computeRowCheckPolynomials(wordPolys)
 * // Returns 4 polynomials, one per row
 */
export function computeRowCheckPolynomials(wordPolynomials: number[][]): number[][] {
  const wordCount = wordPolynomials.length;
  const rowCount = wordCount / WORDS_PER_ROW;
  const rowPolynomials: number[][] = [];
  
  for (let row = 0; row < rowCount; row++) {
    const base = row * WORDS_PER_ROW;
    const rowPoly = sumPolynomials([
      wordPolynomials[base],
      wordPolynomials[base + 1],
      wordPolynomials[base + 2]
    ]);
    rowPolynomials.push(rowPoly);
  }
  
  return rowPolynomials;
}

/**
 * Computes Global Integrity Check (GIC) polynomial from word polynomials.
 * 
 * PATH B: Creates GIC polynomial by summing all word polynomial coefficients.
 * 
 * Creates a polynomial that is the sum of all word polynomials. Evaluating this
 * polynomial at any share number x gives the same result as Path A (sum of all
 * word shares).
 * 
 * @param wordPolynomials - Array of word polynomials (one per word)
 * @returns Global Integrity Check (GIC) polynomial
 * 
 * @example
 * // For 12 words with degree-1 polynomials (k=2)
 * const wordPolys = [[1680, 456], [1471, 789], ...]
 * const gicPoly = computeGlobalIntegrityCheckPolynomial(wordPolys)
 * // Returns one polynomial representing sum of all words
 */
export function computeGlobalIntegrityCheckPolynomial(wordPolynomials: number[][]): number[] {
  return sumPolynomials(wordPolynomials);
}


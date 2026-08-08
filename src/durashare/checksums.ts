/**
 * DuraShare Checksum Functions
 *
 * Per-row checksums, column checksums, and Global Integrity Check (GIC)
 * for DuraShare over GF(2053) (protocol v0.5.0).
 *
 * Dual-path validation (Path A sum vs Path B polynomial) detects bit flips
 * and hardware faults during share generation and recovery.
 */

import { modAdd } from '../core/field.js';
import { WORDS_PER_ROW, COLUMN_TAGS, COLUMN_TOTAL } from '../utils/validation.js';

/**
 * Sum of row position tags 1..rowCount (not reduced mod 2053).
 * Used in unbound GIC: words + rowTotal + COLUMN_TOTAL.
 */
export function computeRowTotal(rowCount: number): number {
  return (rowCount * (rowCount + 1)) / 2;
}

/**
 * Adds a value to the constant term (index 0) of a polynomial.
 */
export function addConstantTerm(polynomial: number[], offset: number): number[] {
  const result = polynomial.slice();
  result[0] = modAdd(result[0], offset);
  return result;
}

/**
 * Position-bound row checksums (v0.5.0).
 * C_r = (w[3r] + w[3r+1] + w[3r+2] + (r+1)) mod 2053
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
    checks.push(modAdd(sum, row + 1));
  }

  return checks;
}

/**
 * Column checksums with tags [10, 20, 30].
 * Col_k = (Σ_rows word[row, k] + TAG_k) mod 2053
 */
export function computeColumnChecks(wordIndices: number[]): number[] {
  const rowCount = wordIndices.length / WORDS_PER_ROW;
  const checks: number[] = [];

  for (let col = 0; col < 3; col++) {
    let sum = 0;
    for (let row = 0; row < rowCount; row++) {
      sum = modAdd(sum, wordIndices[row * WORDS_PER_ROW + col]);
    }
    checks.push(modAdd(sum, COLUMN_TAGS[col]));
  }

  return checks;
}

/**
 * Unbound Global Integrity Check (before share-number binding).
 * GIC_unbound = (Σ words + rowTotal + 60) mod 2053
 */
export function computeGlobalIntegrityCheck(wordIndices: number[]): number {
  const rowCount = wordIndices.length / WORDS_PER_ROW;
  const wordSum = wordIndices.reduce((acc, value) => modAdd(acc, value), 0);
  return modAdd(modAdd(wordSum, computeRowTotal(rowCount)), COLUMN_TOTAL);
}

/**
 * Sums polynomial coefficients modulo 2053 (Path B building block).
 */
export function sumPolynomials(polynomials: number[][]): number[] {
  if (polynomials.length === 0) {
    throw new Error('Cannot sum zero polynomials');
  }

  const degree = polynomials[0].length;

  for (let i = 1; i < polynomials.length; i++) {
    if (polynomials[i].length !== degree) {
      throw new Error(
        `Polynomial degree mismatch: expected ${degree - 1} but got ${polynomials[i].length - 1} at index ${i}`
      );
    }
  }

  const result: number[] = new Array(degree).fill(0);
  for (const poly of polynomials) {
    for (let i = 0; i < degree; i++) {
      result[i] = modAdd(result[i], poly[i]);
    }
  }

  return result;
}

/**
 * Row checksum polynomials with position tags in the constant term.
 */
export function computeRowCheckPolynomials(wordPolynomials: number[][]): number[][] {
  const wordCount = wordPolynomials.length;
  const rowCount = wordCount / WORDS_PER_ROW;
  const rowPolynomials: number[][] = [];

  for (let row = 0; row < rowCount; row++) {
    const base = row * WORDS_PER_ROW;
    const rowPoly = addConstantTerm(
      sumPolynomials([
        wordPolynomials[base],
        wordPolynomials[base + 1],
        wordPolynomials[base + 2]
      ]),
      row + 1
    );
    rowPolynomials.push(rowPoly);
  }

  return rowPolynomials;
}

/**
 * Column checksum polynomials with tags 10/20/30 in the constant term.
 */
export function computeColumnCheckPolynomials(wordPolynomials: number[][]): number[][] {
  const wordCount = wordPolynomials.length;
  const rowCount = wordCount / WORDS_PER_ROW;
  const columnPolynomials: number[][] = [];

  for (let col = 0; col < 3; col++) {
    const columnWordPolys: number[][] = [];
    for (let row = 0; row < rowCount; row++) {
      columnWordPolys.push(wordPolynomials[row * WORDS_PER_ROW + col]);
    }
    columnPolynomials.push(
      addConstantTerm(sumPolynomials(columnWordPolys), COLUMN_TAGS[col])
    );
  }

  return columnPolynomials;
}

/**
 * Unbound GIC polynomial: sum(words) + rowTotal + COLUMN_TOTAL in the constant term.
 */
export function computeGlobalIntegrityCheckPolynomial(wordPolynomials: number[][]): number[] {
  const rowCount = wordPolynomials.length / WORDS_PER_ROW;
  return addConstantTerm(
    addConstantTerm(sumPolynomials(wordPolynomials), computeRowTotal(rowCount)),
    COLUMN_TOTAL
  );
}

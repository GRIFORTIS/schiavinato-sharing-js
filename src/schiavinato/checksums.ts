/**
 * Schiavinato Sharing Checksum Functions
 * 
 * This module implements the per-row and master checksums that are
 * unique to the Schiavinato Sharing scheme.
 */

import { modAdd } from '../core/field.js';
import { WORDS_PER_ROW } from '../utils/validation.js';

/**
 * Computes the per-row checksum (sum of three words) for all word indices.
 * 
 * For a mnemonic with N words arranged in rows of 3, computes N/3 checksums:
 * checksum[i] = (word[3i] + word[3i+1] + word[3i+2]) mod 2053
 * 
 * These row checksums provide error detection for individual rows and
 * can be used to identify which specific shares are corrupt during recovery.
 * 
 * @param wordIndices - Array of BIP39 word indices (0-2047)
 * @returns Array of row checksums in GF(2053)
 * 
 * @example
 * // For 12-word mnemonic with indices [1679, 1470, 216, 41, 1337, 278, ...]
 * computeRowChecks([1679, 1470, 216, 41, 1337, 278, 1906, 323, 467, 681, 1843, 125])
 * // Returns [1312, 1656, 643, 596]
 * // where 1312 = (1679 + 1470 + 216) mod 2053
 * //       1656 = (41 + 1337 + 278) mod 2053
 * //       643 = (1906 + 323 + 467) mod 2053
 * //       596 = (681 + 1843 + 125) mod 2053
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
 * Calculates the master checksum by summing all word indices mod 2053.
 * 
 * This provides an overall checksum that complements the per-row checksums.
 * During recovery, if row checksums pass but the master checksum fails,
 * it indicates a more subtle corruption pattern.
 * 
 * @param wordIndices - Array of BIP39 word indices (0-2047)
 * @returns The master checksum in GF(2053)
 * 
 * @example
 * // For 12-word mnemonic
 * computeMasterCheck([1679, 1470, 216, 41, 1337, 278, 1906, 323, 467, 681, 1843, 125])
 * // Returns 101
 * // where 101 = (1679 + 1470 + ... + 125) mod 2053
 */
export function computeMasterCheck(wordIndices: number[]): number {
  return wordIndices.reduce((acc, value) => modAdd(acc, value), 0);
}


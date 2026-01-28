/**
 * Input Validation and Normalization Utilities
 * 
 * This module provides validation and sanitization functions for mnemonics,
 * share data, and other inputs to the Schiavinato Sharing scheme.
 */

import { FIELD_PRIME } from '../core/field.js';
import type { ShareData } from '../types.js';

/** Number of words per row in the Schiavinato scheme */
export const WORDS_PER_ROW = 3;

/**
 * Normalizes whitespace and case on a mnemonic and ensures it is non-empty.
 * 
 * @param mnemonic - The input mnemonic string
 * @returns Normalized mnemonic with single spaces, lowercase
 * @throws {Error} If mnemonic is not a string or is empty
 * 
 * @example
 * sanitizeMnemonic('  SPIN  result   BRAND  ') 
 * // Returns 'spin result brand'
 * 
 * sanitizeMnemonic('spin\nresult\tbrand')
 * // Returns 'spin result brand'
 */
export function sanitizeMnemonic(mnemonic: string): string {
  if (typeof mnemonic !== 'string') {
    throw new Error('Mnemonic must be a string.');
  }
  
  const normalized = mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');
  
  if (!normalized) {
    throw new Error('Mnemonic cannot be empty.');
  }
  
  return normalized;
}

/**
 * Ensures the mnemonic word count is one of the supported lengths.
 * 
 * Currently supports 12-word and 24-word mnemonics only.
 * 
 * @param wordCount - The number of words in the mnemonic
 * @throws {Error} If word count is not 12 or 24
 * 
 * @example
 * ensureSupportedWordCount(12) // OK
 * ensureSupportedWordCount(24) // OK
 * ensureSupportedWordCount(15) // Throws error
 */
export function ensureSupportedWordCount(wordCount: number): void {
  if (wordCount !== 12 && wordCount !== 24) {
    throw new Error('This tool currently supports only 12- or 24-word mnemonics.');
  }
}

/**
 * Validates that a share value is an integer inside GF(2053) and returns it.
 * 
 * @param value - The value to validate
 * @param label - A descriptive label for error messages
 * @returns The validated value
 * @throws {Error} If value is not an integer or is out of range
 * 
 * @example
 * normalizeShareValue(100, 'Word share #1') // Returns 100
 * normalizeShareValue(2053, 'Word share #1') // Throws error
 * normalizeShareValue(-1, 'Word share #1') // Throws error
 */
export function normalizeShareValue(value: number, label: string): number {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be an integer inside GF(2053).`);
  }
  
  if (value < 0 || value >= FIELD_PRIME) {
    throw new Error(`${label} must be between 0 and ${FIELD_PRIME - 1}.`);
  }
  
  return value;
}

/**
 * Performs structural validation on each share before attempting recovery.
 * 
 * Validates:
 * - Share numbers are valid integers in range [1, 2052]
 * - Each share has the correct number of word values
 * - Each share has the correct number of checksum values
 * - Each share has a Global Integrity Check (GIC) verification value
 * 
 * @param shares - Array of shares to validate
 * @param wordCount - Expected number of words (12 or 24)
 * @throws {Error} If any share has structural problems
 * 
 * @example
 * validateSharesForRecovery([
 *   { shareNumber: 1, wordShares: [...], checksumShares: [...], globalIntegrityCheckShare: 123 },
 *   { shareNumber: 2, wordShares: [...], checksumShares: [...], globalIntegrityCheckShare: 456 }
 * ], 12);
 */
export function validateSharesForRecovery(shares: ShareData[], wordCount: number): void {
  const rowCount = wordCount / WORDS_PER_ROW;
  
  shares.forEach((share, index) => {
    if (!Number.isInteger(share.shareNumber) || 
        share.shareNumber <= 0 || 
        share.shareNumber >= FIELD_PRIME) {
      throw new Error(
        `Share #${index + 1} is missing a valid share number (1-${FIELD_PRIME - 1}).`
      );
    }
    
    if (!Array.isArray(share.wordShares) || share.wordShares.length !== wordCount) {
      throw new Error(
        `Share #${share.shareNumber} does not contain ${wordCount} word values.`
      );
    }
    
    if (!Array.isArray(share.checksumShares) || share.checksumShares.length !== rowCount) {
      throw new Error(
        `Share #${share.shareNumber} does not contain ${rowCount} checksum values.`
      );
    }
    
    if (!Number.isInteger(share.globalIntegrityCheckShare)) {
      throw new Error(
        `Share #${share.shareNumber} is missing a Global Integrity Check (GIC) verification share.`
      );
    }
  });
}

/**
 * Ensures that every share provided has a unique X coordinate.
 * 
 * @param shares - Array of shares to check
 * @throws {Error} If duplicate share numbers are detected
 * 
 * @example
 * ensureShareNumbersDistinct([
 *   { shareNumber: 1, ... },
 *   { shareNumber: 2, ... }
 * ]); // OK
 * 
 * ensureShareNumbersDistinct([
 *   { shareNumber: 1, ... },
 *   { shareNumber: 1, ... }
 * ]); // Throws error
 */
export function ensureShareNumbersDistinct(shares: ShareData[]): void {
  const seen = new Set<number>();
  
  for (const share of shares) {
    if (seen.has(share.shareNumber)) {
      throw new Error('Duplicate share numbers detected.');
    }
    seen.add(share.shareNumber);
  }
}


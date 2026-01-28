/**
 * BIP39 Lookup Functions - 1-Based Native Implementation
 * 
 * This module provides O(1) bidirectional conversion between BIP39 words and 1-based IDs.
 * 
 * Key Design Decisions:
 * - All BIP39 IDs are 1-based (abandon = 1, zoo = 2048)
 * - No +1/-1 conversions anywhere in application code
 * - Single source of truth for word/ID mapping
 * - Supports GF(2053) edge cases: 0, 2049, 2050, 2051, 2052
 * 
 * Performance:
 * - O(1) lookups (constant time)
 * - Built once at module load time
 * - No array scanning required
 */

import { BIP39_WORDLIST } from './wordlist.js';

/**
 * Map from BIP39 word to 1-based ID
 * Example: wordToId['abandon'] = 1, wordToId['zoo'] = 2048
 */
export const wordToId: Record<string, number> = {};

/**
 * Map from 1-based ID to BIP39 word
 * Example: idToWord[1] = 'abandon', idToWord[2048] = 'zoo'
 * 
 * Also includes GF(2053) special values for share display:
 * - idToWord[0] = '[0-out-of-range]'
 * - idToWord[2049] = '[2049-out-of-range]'
 * - idToWord[2050] = '[2050-out-of-range]'
 * - idToWord[2051] = '[2051-out-of-range]'
 * - idToWord[2052] = '[2052-out-of-range]'
 */
export const idToWord: Record<number, string> = {};

// Initialize lookup maps at module load time (ONE-TIME conversion)
BIP39_WORDLIST.forEach((word, arrayIndex) => {
  // Convert 0-based array index to 1-based BIP39 ID
  // This is the ONLY place in the entire codebase where this conversion happens
  const bip39Id = arrayIndex + 1;
  
  wordToId[word] = bip39Id;
  idToWord[bip39Id] = word;
});

// Add GF(2053) special values for share display
// Per TEST_VECTORS.md: edge cases show formatted number in word column
// ID 0 shows as "0000" in word column, actual "0" in ID column
idToWord[0] = '0000';
idToWord[2049] = '2049';
idToWord[2050] = '2050';
idToWord[2051] = '2051';
idToWord[2052] = '2052';

/**
 * Convert BIP39 word to 1-based ID.
 * 
 * @param word - BIP39 word (case-insensitive)
 * @returns 1-based BIP39 ID (1-2048)
 * @throws {Error} If word is not in the BIP39 wordlist
 * 
 * @example
 * wordToBip39Id('abandon') // Returns 1
 * wordToBip39Id('zoo')     // Returns 2048
 * wordToBip39Id('spin')    // Returns 1680
 */
export function wordToBip39Id(word: string): number {
  const normalized = word.toLowerCase().trim();
  const id = wordToId[normalized];
  
  if (id === undefined) {
    throw new Error(`Word "${word}" is not in the BIP39 wordlist`);
  }
  
  return id;
}

/**
 * Convert 1-based ID to BIP39 word.
 * 
 * Supports both BIP39 range (1-2048) and GF(2053) special values (0, 2049-2052).
 * 
 * For edge cases, returns 4-digit representation for word column display.
 * Per TEST_VECTORS.md: edge cases display as:
 * - Word column: "0000" (for ID 0), "2049" (for ID 2049), etc.
 * - ID column: actual number (0, 2049, 2050, 2051, or 2052)
 * 
 * @param id - 1-based BIP39 ID or GF(2053) special value
 * @returns BIP39 word or 4-digit string for edge cases
 * @throws {Error} If ID is not valid
 * 
 * @example
 * bip39IdToWord(1)    // Returns 'abandon'
 * bip39IdToWord(2048) // Returns 'zoo'
 * bip39IdToWord(1680) // Returns 'spin'
 * bip39IdToWord(0)    // Returns '0000' (word column display)
 * bip39IdToWord(2052) // Returns '2052' (word column display)
 */
export function bip39IdToWord(id: number): string {
  const word = idToWord[id];
  
  if (word === undefined) {
    throw new Error(
      `ID ${id} is not valid. Valid ranges: 1-2048 for BIP39 words, or 0, 2049-2052 for share values.`
    );
  }
  
  return word;
}

/**
 * Check if value is a valid BIP39 ID (1-2048).
 * 
 * @param value - Number to check
 * @returns true if value is in valid BIP39 range
 * 
 * @example
 * isBip39Id(1)    // true
 * isBip39Id(2048) // true
 * isBip39Id(0)    // false (share value, not BIP39)
 * isBip39Id(2049) // false (share value, not BIP39)
 */
export function isBip39Id(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 2048;
}

/**
 * Check if value is a valid share ID (includes BIP39 + GF(2053) special values).
 * 
 * Valid ranges:
 * - 0 (special value)
 * - 1-2048 (BIP39 words)
 * - 2049-2052 (special values)
 * 
 * @param value - Number to check
 * @returns true if value is valid for share representation
 * 
 * @example
 * isValidShareId(0)    // true
 * isValidShareId(1)    // true
 * isValidShareId(2048) // true
 * isValidShareId(2052) // true
 * isValidShareId(2053) // false (outside GF(2053))
 */
export function isValidShareId(value: number): boolean {
  return Number.isInteger(value) && (value === 0 || (value >= 1 && value <= 2052));
}

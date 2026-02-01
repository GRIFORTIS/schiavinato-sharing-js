/**
 * BIP39 Seed Generation Utilities
 * 
 * This module provides utilities for generating valid BIP39 mnemonics
 * plus helper conversions used by the validator tool.
 * 
 * Introduced in v0.4.0: Uses native BIP39 implementation with 1-based indexing throughout.
 */

import { generateBip39Mnemonic } from '../bip39/generate.js';
import { wordToBip39Id, bip39IdToWord } from '../bip39/index.js';

/**
 * Generates a cryptographically valid BIP39 mnemonic with proper checksum.
 * 
 * Uses native BIP39 implementation with 1-based indexing.
 * 
 * @param wordCount - Number of words (12 or 24)
 * @returns A valid BIP39 mnemonic phrase
 * @throws {Error} If wordCount is not 12 or 24
 * 
 * @example
 * const mnemonic12 = generateValidMnemonic(12);
 * // Returns something like: "abandon abandon abandon ... abandon about"
 * 
 * const mnemonic24 = generateValidMnemonic(24);
 * // Returns a 24-word valid mnemonic
 */
export function generateValidMnemonic(wordCount: 12 | 24): string {
  if (wordCount !== 12 && wordCount !== 24) {
    throw new Error('Word count must be 12 or 24');
  }
  
  // Use native BIP39 generation
  return generateBip39Mnemonic(wordCount);
}

/**
 * Converts a BIP39 mnemonic phrase to an array of 1-based word IDs.
 * 
 * Uses native O(1) lookup with no array scanning or conversions.
 * 
 * @param mnemonic - The mnemonic phrase (space-separated words)
 * @returns Array of 1-based BIP39 IDs (1-2048)
 * @throws {Error} If any word is not found in the wordlist
 * 
 * @example
 * const indices = mnemonicToIndices('abandon abandon abandon...');
 * // Returns [1, 1, 1, ...]
 * 
 * const indices = mnemonicToIndices('spin result brand...');
 * // Returns [1680, 1471, 217, ...]
 */
export function mnemonicToIndices(mnemonic: string): number[] {
  const words = mnemonic.trim().toLowerCase().split(/\s+/);
  
  return words.map((word, position) => {
    try {
      return wordToBip39Id(word);
    } catch (error) {
      throw new Error(`Word "${word}" at position ${position + 1} is not in the BIP39 wordlist`);
    }
  });
}

/**
 * Converts an array of 1-based word IDs to a BIP39 mnemonic phrase.
 * 
 * Uses native O(1) lookup with no array indexing or conversions.
 * 
 * @param indices - Array of 1-based BIP39 IDs (1-2048)
 * @returns The mnemonic phrase
 * @throws {Error} If any ID is out of range
 * 
 * @example
 * const mnemonic = indicesToMnemonic([1, 1, 1, ...]);
 * // Returns 'abandon abandon abandon...'
 * 
 * const mnemonic = indicesToMnemonic([1680, 1471, 217, ...]);
 * // Returns 'spin result brand...'
 */
export function indicesToMnemonic(indices: number[]): string {
  return indices.map((id, position) => {
    if (id < 1 || id > 2048) {
      throw new Error(`ID ${id} at position ${position + 1} is out of range (must be 1-2048)`);
    }
    return bip39IdToWord(id);
  }).join(' ');
}

/**
 * Parses input text that may contain words or indices, with various separators.
 * 
 * Uses native 1-based BIP39 lookups with no array conversions.
 * 
 * @param input - Input text with words or indices separated by spaces, commas, or newlines
 * @returns Object with parsed data: { words: string[], indices: number[], type: 'words' | 'indices' | 'mixed' }
 * 
 * @example
 * parseInput('abandon, abandon, abandon')
 * // Returns { words: ['abandon', 'abandon', 'abandon'], indices: [1, 1, 1], type: 'words' }
 * 
 * parseInput('1 1 1')
 * // Returns { words: ['abandon', 'abandon', 'abandon'], indices: [1, 1, 1], type: 'indices' }
 * 
 * parseInput('1680 1471 217')
 * // Returns { words: ['spin', 'result', 'brand'], indices: [1680, 1471, 217], type: 'indices' }
 */
export function parseInput(input: string): {
  words: string[];
  indices: number[];
  type: 'words' | 'indices' | 'mixed';
} {
  // Normalize input: replace commas and newlines with spaces, then split
  const tokens = input.trim().toLowerCase().replace(/[,\n]+/g, ' ').split(/\s+/).filter(t => t);
  
  let type: 'words' | 'indices' | 'mixed' = 'words';
  const words: string[] = [];
  const indices: number[] = [];
  
  let hasWords = false;
  let hasIndices = false;
  
  for (const token of tokens) {
    // Check if it's a number
    if (/^\d+$/.test(token)) {
      const id = parseInt(token, 10);
      if (id >= 1 && id <= 2048) {
        // It's a 1-based BIP39 ID
        indices.push(id);
        words.push(bip39IdToWord(id));
        hasIndices = true;
      } else if (id === 0 || (id >= 2049 && id <= 2052)) {
        // It's a share value (for validator UI): 0 or 2049-2052
        indices.push(id);
        words.push(`[${id}]`); // Placeholder for share values
        hasIndices = true;
      } else {
        throw new Error(`ID ${id} is out of range (valid: 1-2048 for BIP39 words, or 0, 2049-2052 for share values)`);
      }
    } else {
      // It's a word - use native lookup
      try {
        const id = wordToBip39Id(token);
        words.push(token);
        indices.push(id);
        hasWords = true;
      } catch {
        throw new Error(`Word "${token}" is not in the BIP39 wordlist`);
      }
    }
  }
  
  if (hasWords && hasIndices) {
    type = 'mixed';
  } else if (hasIndices) {
    type = 'indices';
  } else {
    type = 'words';
  }
  
  return { words, indices, type };
}


/**
 * BIP39 Seed Generation Utilities
 * 
 * This module provides utilities for generating valid BIP39 mnemonics
 * plus helper conversions used by the validator tool.
 */

import { generateMnemonic } from '@scure/bip39';
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english';

/**
 * Generates a cryptographically valid BIP39 mnemonic with proper checksum.
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
  
  // Calculate entropy bits: 12 words = 128 bits, 24 words = 256 bits
  const entropyBits = wordCount === 12 ? 128 : 256;
  
  // Convert entropy to mnemonic (includes checksum calculation)
  // generateMnemonic() from @scure/bip39 generates its own random entropy
  return generateMnemonic(englishWordlist, entropyBits);
}

/**
 * Converts a BIP39 mnemonic phrase to an array of word indices.
 * 
 * @param mnemonic - The mnemonic phrase (space-separated words)
 * @param wordlist - Optional custom wordlist (defaults to English)
 * @returns Array of indices (0-2047)
 * @throws {Error} If any word is not found in the wordlist
 * 
 * @example
 * const indices = mnemonicToIndices('abandon abandon abandon...');
 * // Returns [0, 0, 0, ...]
 */
export function mnemonicToIndices(mnemonic: string, wordlist: string[] = englishWordlist): number[] {
  const words = mnemonic.trim().toLowerCase().split(/\s+/);
  
  return words.map((word, index) => {
    const wordIndex = wordlist.indexOf(word);
    if (wordIndex === -1) {
      throw new Error(`Word "${word}" at position ${index + 1} is not in the BIP39 wordlist`);
    }
    return wordIndex;
  });
}

/**
 * Converts an array of word indices to a BIP39 mnemonic phrase.
 * 
 * @param indices - Array of BIP39 word indices (0-2047)
 * @param wordlist - Optional custom wordlist (defaults to English)
 * @returns The mnemonic phrase
 * @throws {Error} If any index is out of range
 * 
 * @example
 * const mnemonic = indicesToMnemonic([0, 0, 0, ...]);
 * // Returns 'abandon abandon abandon...'
 */
export function indicesToMnemonic(indices: number[], wordlist: string[] = englishWordlist): string {
  return indices.map((index, position) => {
    if (index < 0 || index >= wordlist.length) {
      throw new Error(`Index ${index} at position ${position + 1} is out of range (must be 0-${wordlist.length - 1})`);
    }
    return wordlist[index];
  }).join(' ');
}

/**
 * Parses input text that may contain words or indices, with various separators.
 * 
 * @param input - Input text with words or indices separated by spaces, commas, or newlines
 * @param wordlist - Optional custom wordlist (defaults to English)
 * @returns Object with parsed data: { words: string[], indices: number[], type: 'words' | 'indices' | 'mixed' }
 * 
 * @example
 * parseInput('abandon, abandon, abandon')
 * // Returns { words: ['abandon', 'abandon', 'abandon'], indices: [0, 0, 0], type: 'words' }
 * 
 * parseInput('0 0 0')
 * // Returns { words: ['abandon', 'abandon', 'abandon'], indices: [0, 0, 0], type: 'indices' }
 */
export function parseInput(input: string, wordlist: string[] = englishWordlist): {
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
      const index = parseInt(token, 10);
      if (index >= 0 && index <= 2047) {
        // It's a BIP39 index
        indices.push(index);
        words.push(wordlist[index]);
        hasIndices = true;
      } else if (index >= 2048 && index <= 2052) {
        // It's a share value (for validator UI)
        indices.push(index);
        words.push(`[${index}]`); // Placeholder for share values
        hasIndices = true;
      } else {
        throw new Error(`Index ${index} is out of range`);
      }
    } else {
      // It's a word
      const wordIndex = wordlist.indexOf(token);
      if (wordIndex === -1) {
        throw new Error(`Word "${token}" is not in the BIP39 wordlist`);
      }
      words.push(token);
      indices.push(wordIndex);
      hasWords = true;
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


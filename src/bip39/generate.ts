/**
 * BIP39 Mnemonic Generation - Native Implementation
 * 
 * Generates cryptographically secure BIP39 mnemonics using:
 * - @noble/hashes for SHA-256 (checksum calculation)
 * - @noble/hashes for secure random bytes (entropy generation)
 * 
 * Algorithm:
 * 1. Generate random entropy (16-32 bytes depending on word count)
 * 2. Calculate SHA-256 checksum (first N bits)
 * 3. Concatenate entropy + checksum
 * 4. Split into 11-bit chunks
 * 5. Convert each chunk to BIP39 word using 1-based ID
 */

import { randomBytes } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';
import { bip39IdToWord } from './lookup.js';

/**
 * Generates a cryptographically secure BIP39 mnemonic with valid checksum.
 * 
 * Entropy sizes:
 * - 12 words = 128 bits entropy + 4 bits checksum = 132 bits total
 * - 15 words = 160 bits entropy + 5 bits checksum = 165 bits total
 * - 18 words = 192 bits entropy + 6 bits checksum = 198 bits total
 * - 21 words = 224 bits entropy + 7 bits checksum = 231 bits total
 * - 24 words = 256 bits entropy + 8 bits checksum = 264 bits total
 * 
 * @param wordCount - Number of words (12, 15, 18, 21, or 24)
 * @returns Valid BIP39 mnemonic phrase
 * @throws {Error} If wordCount is invalid
 * 
 * @example
 * const mnemonic12 = generateBip39Mnemonic(12);
 * // Returns: "abandon ability ... autumn" (with valid checksum)
 * 
 * const mnemonic24 = generateBip39Mnemonic(24);
 * // Returns 24-word valid mnemonic
 */
export function generateBip39Mnemonic(wordCount: 12 | 15 | 18 | 21 | 24): string {
  // Validate word count
  if (![12, 15, 18, 21, 24].includes(wordCount)) {
    throw new Error(`Invalid word count: ${wordCount}. Must be 12, 15, 18, 21, or 24.`);
  }
  
  // Calculate bit sizes
  const checksumBits = wordCount / 3;
  const entropyBits = wordCount * 11 - checksumBits;
  const entropyBytes = entropyBits / 8;
  
  // Generate cryptographically secure random entropy
  const entropy = randomBytes(entropyBytes);
  
  // Calculate checksum: first N bits of SHA-256(entropy)
  const hash = sha256(entropy);
  const checksumBitsStr = hash[0]
    .toString(2)
    .padStart(8, '0')
    .slice(0, checksumBits);
  
  // Convert entropy to binary string
  const entropyBitsStr = Array.from(entropy)
    .map(byte => byte.toString(2).padStart(8, '0'))
    .join('');
  
  // Concatenate entropy + checksum
  const allBits = entropyBitsStr + checksumBitsStr;
  
  // Split into 11-bit chunks and convert to words
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const start = i * 11;
    const end = start + 11;
    const chunk = allBits.slice(start, end);
    
    // Convert 11-bit chunk to integer (0-2047 in BIP39 spec)
    const bip39Index = parseInt(chunk, 2);
    
    // Convert to 1-based BIP39 ID (1-2048)
    const bip39Id = bip39Index + 1;
    
    // Lookup word
    words.push(bip39IdToWord(bip39Id));
  }
  
  return words.join(' ');
}

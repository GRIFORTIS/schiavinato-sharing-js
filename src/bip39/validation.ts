/**
 * BIP39 Checksum Validation - Native Implementation
 * 
 * Implements BIP39 specification for mnemonic validation.
 * Uses @noble/hashes for SHA-256 computation.
 * 
 * BIP39 Checksum Algorithm:
 * 1. Each word represents 11 bits (range 0-2047 in BIP39 spec)
 * 2. Concatenate all word bits
 * 3. Last N bits are checksum (N = wordCount / 3)
 * 4. Remaining bits are entropy
 * 5. Checksum = first N bits of SHA-256(entropy)
 * 
 * Note: BIP39 spec uses 0-based word indices (0-2047) for bit manipulation.
 * We convert from our 1-based IDs (1-2048) to 0-based (0-2047) for this calculation only.
 */

import { sha256 } from '@noble/hashes/sha256';
import { wordToBip39Id } from './lookup.js';
import { constantTimeStringEqual } from '../utils/security.js';

/**
 * Validates a BIP39 mnemonic by verifying its checksum.
 * 
 * @param mnemonic - The mnemonic phrase to validate
 * @returns true if the mnemonic has a valid BIP39 checksum
 * 
 * @example
 * validateBip39Mnemonic('abandon abandon abandon ... about')  // true
 * validateBip39Mnemonic('abandon abandon abandon ... zoo')    // false (invalid checksum)
 */
export function validateBip39Mnemonic(mnemonic: string): boolean {
  const words = mnemonic.trim().toLowerCase().split(/\s+/);
  
  // Valid word counts: 12, 15, 18, 21, 24
  if (![12, 15, 18, 21, 24].includes(words.length)) {
    return false;
  }
  
  try {
    // Convert words to 1-based IDs, then to 0-based for BIP39 bit manipulation
    const bip39Indices = words.map(word => {
      const id = wordToBip39Id(word);
      // BIP39 spec uses 0-based indices (0-2047) for 11-bit representation
      return id - 1;
    });
    
    // Calculate checksum bits (4-8 bits depending on word count)
    const checksumBits = words.length / 3;
    const entropyBits = words.length * 11 - checksumBits;
    
    // Convert indices to binary string (11 bits per word)
    const binaryString = bip39Indices
      .map(index => index.toString(2).padStart(11, '0'))
      .join('');
    
    // Split into entropy and checksum
    const entropyBitsStr = binaryString.slice(0, entropyBits);
    const checksumBitsStr = binaryString.slice(entropyBits);
    
    // Convert entropy bits to bytes
    const entropyBytes = new Uint8Array(entropyBits / 8);
    for (let i = 0; i < entropyBytes.length; i++) {
      const start = i * 8;
      const end = start + 8;
      entropyBytes[i] = parseInt(entropyBitsStr.slice(start, end), 2);
    }
    
    // Calculate expected checksum: first N bits of SHA-256(entropy)
    const hash = sha256(entropyBytes);
    const expectedChecksum = hash[0]
      .toString(2)
      .padStart(8, '0')
      .slice(0, checksumBits);
    
    // Verify checksum matches (constant-time compare to reduce timing side channels)
    return constantTimeStringEqual(expectedChecksum, checksumBitsStr);
  } catch {
    // If any word lookup fails or other error, mnemonic is invalid
    return false;
  }
}

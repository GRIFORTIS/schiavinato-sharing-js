/**
 * BIP39 Module - Native 1-Based Implementation
 * 
 * This module provides a complete BIP39 implementation with native 1-based indexing.
 * 
 * Key Features:
 * - Embedded English wordlist (no external dependencies)
 * - O(1) bidirectional word/ID lookups
 * - Native checksum validation
 * - Native mnemonic generation
 * - 1-based indexing throughout (abandon = 1, zoo = 2048)
 * - Support for GF(2053) special values (0, 2049-2052)
 * 
 * This replaces @scure/bip39 dependency and eliminates all +1/-1 conversion operations.
 */

// Wordlist
export { BIP39_WORDLIST } from './wordlist.js';

// Lookup functions and maps
export { 
  wordToBip39Id, 
  bip39IdToWord, 
  isBip39Id, 
  isValidShareId,
  wordToId,
  idToWord
} from './lookup.js';

// Validation
export { validateBip39Mnemonic } from './validation.js';

// Generation
export { generateBip39Mnemonic } from './generate.js';

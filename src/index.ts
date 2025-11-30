import { validateMnemonic as validateMnemonicInternal } from '@scure/bip39';
import { wordlist as englishWordlistInternal } from '@scure/bip39/wordlists/english';

/**
 * Schiavinato Sharing - JavaScript/TypeScript Library
 * 
 * Human-executable secret sharing for BIP39 mnemonics using GF(2053).
 * 
 * This library implements the Schiavinato Sharing scheme, which extends
 * Shamir's Secret Sharing with additional checksums for error detection
 * and manual recovery capability.
 * 
 * @packageDocumentation
 */

// Export main API functions
export { splitMnemonic } from './schiavinato/split.js';
export { recoverMnemonic } from './schiavinato/recover.js';

// Export field arithmetic (for advanced use)
export { 
  FIELD_PRIME,
  mod,
  modAdd,
  modSub,
  modMul,
  modInv
} from './core/field.js';

// Export Lagrange functions (for manual recovery)
export { 
  computeLagrangeMultipliers,
  lagrangeInterpolateAtZero 
} from './core/lagrange.js';

// Export polynomial functions (for testing/verification)
export { 
  randomPolynomial,
  evaluatePolynomial 
} from './core/polynomial.js';

// Export checksum functions (for verification)
export { 
  computeRowChecks,
  computeGlobalChecksum 
} from './schiavinato/checksums.js';

// Export utility functions
export { 
  sanitizeMnemonic,
  ensureSupportedWordCount,
  normalizeShareValue,
  validateSharesForRecovery,
  ensureShareNumbersDistinct,
  WORDS_PER_ROW
} from './utils/validation.js';

export {
  configureRandomSource,
  getRandomIntInclusive,
  getRandomFieldElement
} from './utils/random.js';

export {
  generateValidMnemonic,
  mnemonicToIndices,
  indicesToMnemonic,
  parseInput
} from './utils/seedGenerator.js';

// Export security utilities (for advanced security-conscious use)
export {
  constantTimeEqual,
  constantTimeStringEqual,
  secureWipeArray,
  secureWipeNumber,
  wipeString
} from './utils/security.js';

// Export all TypeScript types
export type {
  Share,
  ShareData,
  RecoveryResult,
  SplitOptions,
  RecoverOptions,
  RandomSource,
  Point
} from './types.js';

// Export BIP39 helpers with sensible defaults
export function validateBip39Mnemonic(mnemonic: string, wordlist = englishWordlistInternal): boolean {
  return validateMnemonicInternal(mnemonic, wordlist);
}

export { englishWordlistInternal as englishWordlist };

// Library version
export const VERSION = '0.1.0';

/**
 * Main entry point namespace for backward compatibility with HTML tool.
 * 
 * @example
 * import * as SchiavinatoSharing from '@grifortis/schiavinato-sharing';
 * 
 * const shares = await SchiavinatoSharing.splitMnemonic(mnemonic, 2, 3);
 * const result = await SchiavinatoSharing.recoverMnemonic(shares, 12);
 */


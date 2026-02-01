/**
 * Schiavinato Sharing - JavaScript/TypeScript Library
 * 
 * Human-executable secret sharing for BIP39 mnemonics using GF(2053).
 * 
 * This library implements the Schiavinato Sharing scheme, which extends
 * Shamir's Secret Sharing with additional checksums for error detection
 * and manual recovery capability.
 * 
 * Introduced in v0.4.0: Native 1-based BIP39 implementation with embedded wordlist.
 * All word-to-ID conversions use O(1) lookups with no +1/-1 operations.
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
  computeGlobalIntegrityCheck,
  sumPolynomials,
  computeRowCheckPolynomials,
  computeGlobalIntegrityCheckPolynomial
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

// Export native BIP39 module
export {
  BIP39_WORDLIST as englishWordlist,
  wordToBip39Id,
  bip39IdToWord,
  isBip39Id,
  isValidShareId,
  validateBip39Mnemonic as validateBip39MnemonicNative
} from './bip39/index.js';

// Export BIP39 validation with simple API
export { validateBip39Mnemonic } from './bip39/validation.js';

// Library version
export const VERSION = '0.4.1';

/**
 * Main entry point namespace for backward compatibility with HTML tool.
 * 
 * @example
 * import * as SchiavinatoSharing from '@grifortis/schiavinato-sharing';
 * 
 * const shares = await SchiavinatoSharing.splitMnemonic(mnemonic, 2, 3);
 * const result = await SchiavinatoSharing.recoverMnemonic(shares, 12);
 */


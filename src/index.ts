/**
 * DuraShare - JavaScript/TypeScript Library
 *
 * Human-executable secret sharing for BIP39 mnemonics using GF(2053).
 *
 * Implements the DuraShare scheme (protocol v0.5.0): Shamir sharing with
 * position-bound row checksums, column checksums, and printed GIC.
 *
 * @packageDocumentation
 */

export { splitBip39 } from './durashare/split.js';
export { recoverAndValidate } from './durashare/recover.js';

export {
  FIELD_PRIME,
  mod,
  modAdd,
  modSub,
  modMul,
  modInv
} from './core/field.js';

export {
  computeLagrangeMultipliers,
  lagrangeInterpolateAtZero
} from './core/lagrange.js';

export {
  randomPolynomial,
  evaluatePolynomial
} from './core/polynomial.js';

export {
  computeRowChecks,
  computeColumnChecks,
  computeGlobalIntegrityCheck,
  computeRowTotal,
  sumPolynomials,
  computeRowCheckPolynomials,
  computeColumnCheckPolynomials,
  computeGlobalIntegrityCheckPolynomial,
  addConstantTerm
} from './durashare/checksums.js';

export {
  sanitizeMnemonic,
  ensureSupportedWordCount,
  normalizeShareValue,
  validateSharesForRecovery,
  ensureShareNumbersDistinct,
  auditOptionalChecksums,
  WORDS_PER_ROW,
  COLUMN_TAGS,
  COLUMN_TOTAL
} from './utils/validation.js';

export {
  configureEnvironment,
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

export {
  constantTimeEqual,
  constantTimeStringEqual,
  clearSensitiveArray,
  secureWipeArray,
  secureWipeNumber,
  wipeString
} from './utils/security.js';

export type {
  Share,
  ShareData,
  RecoveryResult,
  SplitResult,
  SplitOptions,
  RecoverOptions,
  RandomSource,
  EnvironmentOptions,
  Point
} from './types.js';

export {
  BIP39_WORDLIST as englishWordlist,
  wordToBip39Id,
  bip39IdToWord,
  isBip39Id,
  isValidShareId,
  validateBip39Mnemonic as validateBip39MnemonicNative
} from './bip39/index.js';

import { validateBip39Mnemonic } from './bip39/validation.js';
export { validateBip39Mnemonic };

/**
 * HTML-aligned name: validates BIP39 and throws on failure; returns true on success.
 */
export async function validateBIP39Mnemonic(
  mnemonic: string,
  _wordlist?: readonly string[]
): Promise<true> {
  if (!validateBip39Mnemonic(mnemonic)) {
    throw new Error('Mnemonic checksum is invalid.');
  }
  return true;
}

/** Library version (protocol-aligned with HTML v0.5.0 share-table subset) */
export const VERSION = '0.5.0';

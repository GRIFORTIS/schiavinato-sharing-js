/**
 * Schiavinato Sharing - Recovery Function
 * 
 * This module implements the share recovery (reconstruction) logic for
 * Schiavinato Sharing over GF(2053).
 */

import { validateMnemonic as validateBip39 } from '@scure/bip39';
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english';
import { mod } from '../core/field.js';
import { lagrangeInterpolateAtZero } from '../core/lagrange.js';
import { computeRowChecks, computeGlobalChecksum } from './checksums.js';
import { 
  ensureSupportedWordCount, 
  normalizeShareValue, 
  validateSharesForRecovery, 
  ensureShareNumbersDistinct,
  WORDS_PER_ROW 
} from '../utils/validation.js';
import { constantTimeEqual, secureWipeArray, secureWipeNumber } from '../utils/security.js';
import type { ShareData, RecoveryResult, RecoverOptions } from '../types.js';

/**
 * Performs unified recovery and validation of a mnemonic from shares.
 * 
 * This function does not throw on validation failures; instead, it returns
 * a detailed report object containing the recovered mnemonic (if successful)
 * and a breakdown of any errors encountered.
 * 
 * Recovery process:
 * 1. Validates share structure and uniqueness
 * 2. Uses Lagrange interpolation to recover word indices
 * 3. Uses Lagrange interpolation to recover checksums
 * 4. Validates row checksums
 * 5. Validates global checksum
 * 6. Validates BIP39 checksum (if previous checks pass)
 * 
 * @param shares - Array of share objects (minimum 2, typically k shares)
 * @param wordCount - Expected word count of original mnemonic (12 or 24)
 * @param options - Optional configuration (custom wordlist, validation settings)
 * @returns Recovery report with mnemonic and error details
 * 
 * @example
 * const result = await recoverMnemonic(
 *   [
 *     { shareNumber: 1, wordShares: [...], checksumShares: [...], globalChecksumVerificationShare: 1819 },
 *     { shareNumber: 2, wordShares: [...], checksumShares: [...], globalChecksumVerificationShare: 1484 }
 *   ],
 *   12
 * );
 * 
 * if (result.success) {
 *   console.log('Recovered:', result.mnemonic);
 * } else {
 *   console.error('Errors:', result.errors);
 * }
 */
export async function recoverMnemonic(
  shares: ShareData[],
  wordCount: number,
  options: RecoverOptions = {}
): Promise<RecoveryResult> {
  const wordlist = options.wordlist || englishWordlist;
  const strictValidation = options.strictValidation !== false;
  
  const report: RecoveryResult = {
    mnemonic: null,
    errors: {
      row: [],
      global: false,
      bip39: false,
      generic: null
    },
    success: false,
    sharesWithInvalidChecksums: new Set()
  };
  
  // Declare sensitive variables outside try block for cleanup in finally
  let recoveredWords: number[] = [];
  let recoveredChecks: number[] = [];
  let recoveredGlobalChecksum = 0;
  
  try {
    // 1. Pre-flight checks for input validity
    if (!Array.isArray(shares) || shares.length < 2) {
      report.errors.generic = 'At least two shares are required for recovery.';
      return report;
    }
    
    ensureSupportedWordCount(wordCount);
    
    if (wordCount % WORDS_PER_ROW !== 0) {
      report.errors.generic = 'Word count must be divisible by the words per row constant.';
      return report;
    }
    
    validateSharesForRecovery(shares, wordCount);
    ensureShareNumbersDistinct(shares);
    
    const rowCount = wordCount / WORDS_PER_ROW;
    
    // 2. Recover all secret numbers via Lagrange Interpolation
    recoveredWords = [];
    
    for (let i = 0; i < wordCount; i++) {
      const points = shares.map((share) => ({
        x: mod(share.shareNumber),
        y: normalizeShareValue(
          share.wordShares[i], 
          `Word share #${i + 1} (share ${share.shareNumber})`
        )
      }));
      recoveredWords.push(lagrangeInterpolateAtZero(points));
    }
    
    recoveredChecks = [];
    
    for (let row = 0; row < rowCount; row++) {
      const points = shares.map((share) => ({
        x: mod(share.shareNumber),
        y: normalizeShareValue(
          share.checksumShares[row], 
          `Checksum share C${row + 1} (share ${share.shareNumber})`
        )
      }));
      recoveredChecks.push(lagrangeInterpolateAtZero(points));
    }
    
    const globalChecksumPoints = shares.map((share) => ({
      x: mod(share.shareNumber),
      y: normalizeShareValue(
        share.globalChecksumVerificationShare, 
        `Global Checksum verification (share ${share.shareNumber})`
      )
    }));
    recoveredGlobalChecksum = lagrangeInterpolateAtZero(globalChecksumPoints);
    
    // 3. Perform internal Schiavinato validations
    const recomputedChecks = computeRowChecks(recoveredWords);
    
    for (let row = 0; row < rowCount; row++) {
      // Use constant-time comparison to prevent timing attacks
      if (!constantTimeEqual(recoveredChecks[row], recomputedChecks[row])) {
        report.errors.row.push(row);
      }
    }
    
    const recomputedGlobalChecksum = computeGlobalChecksum(recoveredWords);
    
    // Use constant-time comparison to prevent timing attacks
    if (!constantTimeEqual(recoveredGlobalChecksum, recomputedGlobalChecksum)) {
      report.errors.global = true;
    }
    
    // 4. If internal checks pass, proceed to BIP39 validation
    if (report.errors.row.length === 0 && !report.errors.global) {
      // Validate word indices are in BIP39 range
      for (let i = 0; i < recoveredWords.length; i++) {
        const value = recoveredWords[i];
        if (value < 0 || value >= 2048) {
          report.errors.generic = 
            `Recovered word #${i + 1} ("${value}") is outside the BIP39 range (0–2047). ` +
            `Cannot form a valid mnemonic.`;
          return report;
        }
      }
      
      // Convert indices to words
      const mnemonic = recoveredWords.map((index) => wordlist[index]).join(' ');
      report.mnemonic = mnemonic;
      
      // Validate BIP39 checksum
      if (strictValidation) {
        try {
          if (!validateBip39(mnemonic, wordlist)) {
            report.errors.bip39 = true;
          }
        } catch (bip39Error) {
          report.errors.bip39 = true;
        }
      }
    }
    
    // 5. Determine success
    report.success = 
      report.errors.row.length === 0 && 
      !report.errors.global && 
      !report.errors.bip39 && 
      report.mnemonic !== null;
    
  } catch (error) {
    // Catch unrecoverable errors (e.g., bad inputs, non-invertible matrix)
    report.errors.generic = (error as Error).message;
  } finally {
    // Security: Clean up sensitive data from memory
    secureWipeArray(recoveredWords);
    secureWipeArray(recoveredChecks);
    recoveredGlobalChecksum = secureWipeNumber(recoveredGlobalChecksum);
  }
  
  return report;
}


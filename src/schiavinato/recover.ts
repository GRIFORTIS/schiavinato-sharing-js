/**
 * Schiavinato Sharing - Recovery Function
 * 
 * This module implements the share recovery (reconstruction) logic for
 * Schiavinato Sharing over GF(2053).
 */

import { validateBip39Mnemonic } from '../bip39/validation.js';
import { bip39IdToWord } from '../bip39/lookup.js';
import { mod } from '../core/field.js';
import { lagrangeInterpolateAtZero } from '../core/lagrange.js';
import { computeRowChecks, computeGlobalIntegrityCheck } from './checksums.js';
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
 * 4. v0.4.0: Validates dual-path checksums (Path A vs Path B)
 * 5. Validates row checksums
 * 6. Validates Global Integrity Check (GIC)
 * 7. Validates BIP39 checksum (if previous checks pass)
 * 
 * v0.4.0 Change: Implements dual-path checksum validation during recovery.
 * Path A computes checksums from recovered word values (recompute).
 * Path B uses the interpolated checksum shares directly.
 * Both paths must agree to confirm no bit flips or hardware faults occurred.
 * 
 * @param shares - Array of share objects (minimum 2, typically k shares)
 * @param wordCount - Expected word count of original mnemonic (12 or 24)
 * @param options - Optional configuration (validation settings)
 * @returns Recovery report with mnemonic and error details
 * 
 * @example
 * const result = await recoverMnemonic(
 *   [
 *     { shareNumber: 1, wordShares: [...], checksumShares: [...], globalIntegrityCheckShare: 1819 },
 *     { shareNumber: 2, wordShares: [...], checksumShares: [...], globalIntegrityCheckShare: 1484 }
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
  const strictValidation = options.strictValidation !== false;
  
  const report: RecoveryResult = {
    mnemonic: null,
    errors: {
      row: [],
      global: false,
      bip39: false,
      generic: null,
      rowPathMismatch: [],
      globalPathMismatch: false
    },
    success: false,
    sharesWithInvalidChecksums: new Set()
  };
  
  // Declare sensitive variables outside try block for cleanup in finally
  let recoveredWords: number[] = [];
  let recoveredChecks: number[] = [];
  let recoveredGlobalIntegrityCheck = 0;
  
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
    
    const globalIntegrityCheckPoints = shares.map((share) => ({
      x: mod(share.shareNumber),
      y: normalizeShareValue(
        share.globalIntegrityCheckShare, 
        `Global Integrity Check (GIC) verification (share ${share.shareNumber})`
      )
    }));
    recoveredGlobalIntegrityCheck = lagrangeInterpolateAtZero(globalIntegrityCheckPoints);
    
    // 3. Perform internal Schiavinato validations with dual-path checking (v0.4.0)
    // Path A: Recompute checksums from recovered words (direct computation)
    const recomputedChecks = computeRowChecks(recoveredWords);
    const recomputedGlobalIntegrityCheck = computeGlobalIntegrityCheck(recoveredWords);
    
    // Path B: Interpolated checksum values (polynomial evaluation at x=0)
    // recoveredChecks and recoveredGlobalIntegrityCheck come from Lagrange interpolation
    
    // First, validate Path A vs Path B (detects bit flips/hardware faults)
    for (let row = 0; row < rowCount; row++) {
      // Use constant-time comparison to prevent timing attacks
      if (!constantTimeEqual(recoveredChecks[row], recomputedChecks[row])) {
        report.errors.rowPathMismatch!.push(row);
      }
    }
    
    // Use constant-time comparison to prevent timing attacks
    if (!constantTimeEqual(recoveredGlobalIntegrityCheck, recomputedGlobalIntegrityCheck)) {
      report.errors.globalPathMismatch = true;
    }
    
    // Second, perform standard checksum validation (backward compatibility)
    // This is the same as Path A validation but maintains the existing error structure
    for (let row = 0; row < rowCount; row++) {
      if (!constantTimeEqual(recoveredChecks[row], recomputedChecks[row])) {
        report.errors.row.push(row);
      }
    }
    
    if (!constantTimeEqual(recoveredGlobalIntegrityCheck, recomputedGlobalIntegrityCheck)) {
      report.errors.global = true;
    }
    
    // 4. If internal checks pass, proceed to BIP39 validation
    if (report.errors.row.length === 0 && !report.errors.global) {
      // Validate word indices are in BIP39 range
      for (let i = 0; i < recoveredWords.length; i++) {
        const value = recoveredWords[i];
        if (value < 1 || value > 2048) {
          report.errors.generic = 
            `Recovered word #${i + 1} ("${value}") is outside the BIP39 range (1–2048). ` +
            `Cannot form a valid mnemonic.`;
          return report;
        }
      }
      
      // Convert 1-based IDs to words using native lookup (no conversions)
      const mnemonic = recoveredWords.map((id) => bip39IdToWord(id)).join(' ');
      report.mnemonic = mnemonic;
      
      // Validate BIP39 checksum using native implementation
      if (strictValidation) {
        try {
          if (!validateBip39Mnemonic(mnemonic)) {
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
      report.errors.rowPathMismatch!.length === 0 &&
      !report.errors.globalPathMismatch &&
      report.mnemonic !== null;
    
  } catch (error) {
    // Catch unrecoverable errors (e.g., bad inputs, non-invertible matrix)
    report.errors.generic = (error as Error).message;
  } finally {
    // Security: Clean up sensitive data from memory
    secureWipeArray(recoveredWords);
    secureWipeArray(recoveredChecks);
    recoveredGlobalIntegrityCheck = secureWipeNumber(recoveredGlobalIntegrityCheck);
  }
  
  return report;
}


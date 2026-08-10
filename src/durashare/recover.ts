/**
 * DuraShare - Recovery Function
 *
 * Share recovery (reconstruction) for DuraShare over GF(2053), protocol v0.5.0.
 */

import { validateBip39Mnemonic } from '../bip39/validation.js';
import { bip39IdToWord } from '../bip39/lookup.js';
import { BIP39_WORDLIST } from '../bip39/wordlist.js';
import { mod, modAdd, modMul } from '../core/field.js';
import {
  lagrangeInterpolateAtZero,
  computeLagrangeMultipliers
} from '../core/lagrange.js';
import {
  computeRowChecks,
  computeColumnChecks,
  computeGlobalIntegrityCheck,
  computeRowTotal
} from './checksums.js';
import {
  ensureSupportedWordCount,
  normalizeShareValue,
  validateSharesForRecovery,
  ensureShareNumbersDistinct,
  auditOptionalChecksums,
  WORDS_PER_ROW
} from '../utils/validation.js';
import { constantTimeEqual, clearSensitiveArray } from '../utils/security.js';
import type { ShareData, RecoveryResult, RecoverOptions } from '../types.js';

/**
 * Unified recovery and validation. Does not throw on soft validation failures;
 * returns a detailed report (aligned with the HTML tool).
 */
export async function recoverAndValidate(
  shares: ShareData[],
  wordCount: number,
  options: RecoverOptions = {}
): Promise<RecoveryResult> {
  const strictValidation = options.strictValidation !== false;
  const wordlist = options.wordlist ?? BIP39_WORDLIST;

  const report: RecoveryResult = {
    recoveredMnemonic: null,
    recoveredIndices: null,
    errors: {
      row: [],
      global: false,
      bip39: false,
      generic: null,
      shareValidation: null,
      rowPathMismatch: [],
      globalPathMismatch: false,
      column: [],
      failedRows: [],
      globalIntegrityCheckError: {
        failed: false,
        isNightmare: false
      }
    },
    success: false
  };

  let recoveredWords: number[] = [];
  let recoveredChecks: number[] = [];
  let recoveredColumnChecks: Array<number | undefined> = [];
  let recoveredGlobalIntegrityCheck = 0;

  try {
    if (!Array.isArray(shares) || shares.length < 2) {
      report.errors.generic = 'At least two shares are required for recovery.';
      return report;
    }

    ensureSupportedWordCount(wordCount);

    if (wordCount % WORDS_PER_ROW !== 0) {
      report.errors.generic =
        'Word count must be divisible by the words per row constant.';
      return report;
    }

    validateSharesForRecovery(shares, wordCount);
    ensureShareNumbersDistinct(shares);

    const rowCount = wordCount / WORDS_PER_ROW;
    const rowTotal = computeRowTotal(rowCount);

    const shareValidation = {
      rowErrors: [] as { shareIndex: number; rowIndex: number }[],
      columnErrors: [] as { shareIndex: number; columnIndex: number }[],
      globalErrors: [] as { shareIndex: number }[]
    };

    shares.forEach((share, index) => {
      const shareIndex = Number.isInteger(share.shareIndex)
        ? (share.shareIndex as number)
        : index + 1;
      const shareNumber = normalizeShareValue(
        share.shareNumber,
        `Share #${shareIndex} number`
      );
      if (shareNumber === 0) {
        throw new Error(`Share #${shareIndex} has an invalid share number (0).`);
      }

      const normalized: ShareData = {
        shareNumber,
        wordShares: share.wordShares.map((v, i) =>
          normalizeShareValue(v, `Share #${shareIndex} word ${i + 1}`)
        ),
        checksumShares: [...share.checksumShares],
        columnChecksumShares: [...share.columnChecksumShares],
        globalIntegrityCheckShare: share.globalIntegrityCheckShare
      };

      const audit = auditOptionalChecksums(normalized, rowCount, rowTotal);
      audit.rowFails.forEach((rowIndex) => {
        shareValidation.rowErrors.push({ shareIndex, rowIndex });
      });
      audit.colFails.forEach((columnIndex) => {
        shareValidation.columnErrors.push({ shareIndex, columnIndex });
      });
      if (audit.gicFail) {
        shareValidation.globalErrors.push({ shareIndex });
      }
    });

    if (
      shareValidation.rowErrors.length > 0 ||
      shareValidation.columnErrors.length > 0 ||
      shareValidation.globalErrors.length > 0
    ) {
      const messages: string[] = [];
      if (shareValidation.rowErrors.length > 0) {
        messages.push(
          'Row checksum mismatch detected. Fix the highlighted rows and retry.'
        );
      }
      if (shareValidation.columnErrors.length > 0) {
        messages.push(
          'Column checksum mismatch detected. Fix the highlighted column checksum fields and retry.'
        );
      }
      if (shareValidation.globalErrors.length > 0) {
        messages.push(
          'Printed global integrity value mismatch detected. Fix the highlighted GIC fields and retry.'
        );
      }
      report.errors.shareValidation = {
        rowErrors: shareValidation.rowErrors,
        columnErrors: shareValidation.columnErrors,
        globalErrors: shareValidation.globalErrors,
        message: messages.join('\n')
      };
      report.errors.generic = report.errors.shareValidation.message;
      return report;
    }

    const shareNumbers = shares.map((share) => share.shareNumber);
    const multipliers = computeLagrangeMultipliers(shareNumbers);
    const sanityCheck = multipliers.reduce((acc, coef, idx) => {
      return modAdd(acc, modMul(coef, shareNumbers[idx]));
    }, 0);
    if (sanityCheck !== 0) {
      report.errors.generic =
        'Lagrange coefficient sanity check failed. Verify share numbers and coefficients.';
      return report;
    }

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

    recoveredChecks = new Array(rowCount);
    for (let row = 0; row < rowCount; row++) {
      if (!shares.every((share) => Number.isInteger(share.checksumShares[row]))) {
        continue;
      }
      const points = shares.map((share) => ({
        x: mod(share.shareNumber),
        y: normalizeShareValue(
          share.checksumShares[row] as number,
          `Checksum share C${row + 1} (share ${share.shareNumber})`
        )
      }));
      recoveredChecks[row] = lagrangeInterpolateAtZero(points);
    }

    recoveredColumnChecks = [undefined, undefined, undefined];
    for (let col = 0; col < 3; col++) {
      if (
        !shares.every((share) =>
          Number.isInteger(share.columnChecksumShares[col])
        )
      ) {
        continue;
      }
      const points = shares.map((share) => ({
        x: mod(share.shareNumber),
        y: normalizeShareValue(
          share.columnChecksumShares[col] as number,
          `Column checksum Col${col + 1} (share ${share.shareNumber})`
        )
      }));
      recoveredColumnChecks[col] = lagrangeInterpolateAtZero(points);
    }

    const allGicProvided = shares.every((share) =>
      Number.isInteger(share.globalIntegrityCheckShare)
    );
    if (allGicProvided) {
      const globalIntegrityCheckPoints = shares.map((share) => ({
        x: mod(share.shareNumber),
        y: normalizeShareValue(
          share.globalIntegrityCheckShare as number,
          `Global Integrity Check (GIC) verification (share ${share.shareNumber})`
        )
      }));
      recoveredGlobalIntegrityCheck = lagrangeInterpolateAtZero(
        globalIntegrityCheckPoints
      );
    }

    const recomputedChecks = computeRowChecks(recoveredWords);
    const recomputedColumnChecks = computeColumnChecks(recoveredWords);
    const recomputedGlobalIntegrityCheck =
      computeGlobalIntegrityCheck(recoveredWords);

    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      if (!Number.isInteger(recoveredChecks[rowIdx])) {
        continue;
      }
      if (
        !constantTimeEqual(recoveredChecks[rowIdx], recomputedChecks[rowIdx])
      ) {
        report.errors.rowPathMismatch.push(rowIdx);
        report.errors.row.push(rowIdx);
      }
    }

    for (let colIdx = 0; colIdx < 3; colIdx++) {
      if (!Number.isInteger(recoveredColumnChecks[colIdx])) {
        continue;
      }
      if (
        !constantTimeEqual(
          recoveredColumnChecks[colIdx] as number,
          recomputedColumnChecks[colIdx]
        )
      ) {
        report.errors.column.push(colIdx);
      }
    }

    if (allGicProvided) {
      if (
        !constantTimeEqual(
          recoveredGlobalIntegrityCheck,
          recomputedGlobalIntegrityCheck
        )
      ) {
        report.errors.globalPathMismatch = true;
        report.errors.global = true;
      }
    }

    report.errors.failedRows = report.errors.row.map((rowIdx) => {
      const rowNumber = rowIdx + 1;
      return {
        rowNumber,
        wordPositions: [
          rowIdx * WORDS_PER_ROW + 1,
          rowIdx * WORDS_PER_ROW + 2,
          rowIdx * WORDS_PER_ROW + 3
        ],
        checksumLabel: `C${rowNumber}`
      };
    });
    report.errors.globalIntegrityCheckError = {
      failed: report.errors.global,
      isNightmare: report.errors.global && report.errors.row.length === 0
    };

    let canFormMnemonic = true;
    for (let i = 0; i < recoveredWords.length; i++) {
      const value = recoveredWords[i];
      if (value < 1 || value > 2048) {
        report.errors.generic =
          `Recovered word #${i + 1} ("${value}") is outside the BIP39 range (1–2048). ` +
          'Cannot form a valid mnemonic.';
        canFormMnemonic = false;
        break;
      }
    }

    if (canFormMnemonic) {
      const mnemonic = options.wordlist
        ? recoveredWords.map((index) => wordlist[index - 1]).join(' ')
        : recoveredWords.map((id) => bip39IdToWord(id)).join(' ');
      report.recoveredMnemonic = mnemonic;
      report.recoveredIndices = [...recoveredWords];

      if (
        report.errors.row.length === 0 &&
        !report.errors.global &&
        report.errors.rowPathMismatch.length === 0 &&
        !report.errors.globalPathMismatch &&
        report.errors.column.length === 0
      ) {
        if (strictValidation) {
          try {
            if (!validateBip39Mnemonic(mnemonic)) {
              report.errors.bip39 = true;
            }
          } catch {
            report.errors.bip39 = true;
          }
        }
      }
    }

    report.success =
      report.errors.row.length === 0 &&
      !report.errors.global &&
      !report.errors.bip39 &&
      report.errors.rowPathMismatch.length === 0 &&
      !report.errors.globalPathMismatch &&
      report.errors.column.length === 0 &&
      report.errors.shareValidation === null &&
      report.recoveredMnemonic !== null;
  } catch (error) {
    report.errors.generic = (error as Error).message;
  } finally {
    clearSensitiveArray(recoveredWords);
    clearSensitiveArray(recoveredChecks);
    clearSensitiveArray(recoveredColumnChecks as number[]);
    recoveredGlobalIntegrityCheck = 0;
  }

  return report;
}

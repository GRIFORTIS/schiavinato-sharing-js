/**
 * Input Validation and Normalization Utilities
 *
 * Validation and sanitization for mnemonics, share data, and other
 * inputs to the DuraShare scheme.
 */

import { FIELD_PRIME, modAdd } from '../core/field.js';
import type { ShareData } from '../types.js';

/** Number of words per row in the DuraShare table */
export const WORDS_PER_ROW = 3;

/** Column position tags for Col1–Col3 (v0.5.0) */
export const COLUMN_TAGS = [10, 20, 30] as const;

/** Sum of COLUMN_TAGS; included in unbound GIC */
export const COLUMN_TOTAL = 60;

/**
 * Normalizes whitespace and case on a mnemonic and ensures it is non-empty.
 */
export function sanitizeMnemonic(mnemonic: string): string {
  if (typeof mnemonic !== 'string') {
    throw new Error('Mnemonic must be a string.');
  }

  const normalized = mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');

  if (!normalized) {
    throw new Error('Mnemonic cannot be empty.');
  }

  return normalized;
}

/**
 * Ensures the mnemonic word count is one of the supported lengths.
 * Supports 12, 15, 18, 21, and 24-word mnemonics (aligned with HTML tool).
 */
export function ensureSupportedWordCount(wordCount: number): void {
  const allowedCounts = [12, 15, 18, 21, 24];
  if (!allowedCounts.includes(wordCount)) {
    throw new Error(
      'This tool currently supports only 12, 15, 18, 21, or 24-word mnemonics.'
    );
  }
}

/**
 * Validates that a share value is an integer inside GF(2053) and returns it.
 */
export function normalizeShareValue(value: number, label: string): number {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be an integer inside GF(2053).`);
  }

  if (value < 0 || value >= FIELD_PRIME) {
    throw new Error(`${label} must be between 0 and ${FIELD_PRIME - 1}.`);
  }

  return value;
}

/**
 * Structural validation before recovery (v0.5.0).
 * Words required; checksum/GIC slots must have correct storage length
 * (values may be optional / non-integer for blank fields).
 */
export function validateSharesForRecovery(shares: ShareData[], wordCount: number): void {
  const rowCount = wordCount / WORDS_PER_ROW;

  shares.forEach((share, index) => {
    if (
      !Number.isInteger(share.shareNumber) ||
      share.shareNumber <= 0 ||
      share.shareNumber >= FIELD_PRIME
    ) {
      throw new Error(
        `Share #${index + 1} is missing a valid share number (1-${FIELD_PRIME - 1}).`
      );
    }

    if (!Array.isArray(share.wordShares) || share.wordShares.length !== wordCount) {
      throw new Error(
        `Share #${share.shareNumber} does not contain ${wordCount} word values.`
      );
    }

    if (!Array.isArray(share.checksumShares) || share.checksumShares.length !== rowCount) {
      throw new Error(
        `Share #${share.shareNumber} has invalid row checksum storage.`
      );
    }

    if (
      !Array.isArray(share.columnChecksumShares) ||
      share.columnChecksumShares.length !== 3
    ) {
      throw new Error(
        `Share #${share.shareNumber} has invalid column checksum storage.`
      );
    }
  });
}

/**
 * Ensures that every share provided has a unique X coordinate.
 */
export function ensureShareNumbersDistinct(shares: ShareData[]): void {
  const seen = new Set<number>();

  for (const share of shares) {
    if (seen.has(share.shareNumber)) {
      throw new Error('Duplicate share numbers detected.');
    }
    seen.add(share.shareNumber);
  }
}

/**
 * Validates optional checksum fields when present (v0.5.0). Words must be complete.
 */
export function auditOptionalChecksums(
  share: ShareData,
  rowCount: number,
  rowTotal: number
): { rowFails: number[]; colFails: number[]; gicFail: boolean } {
  const rowFails: number[] = [];
  const colFails: number[] = [];
  let gicFail = false;
  let wordSum = 0;
  let checksumSum = 0;
  let columnChecksumSum = 0;
  let hasRowError = false;
  let hasColumnError = false;
  const shareNumber = share.shareNumber;

  for (let row = 0; row < rowCount; row++) {
    const base = row * WORDS_PER_ROW;
    const w0 = share.wordShares[base];
    const w1 = share.wordShares[base + 1];
    const w2 = share.wordShares[base + 2];
    wordSum = modAdd(modAdd(wordSum, w0), modAdd(w1, w2));
    const checksum = share.checksumShares[row];
    if (!Number.isInteger(checksum)) {
      continue;
    }
    const rowSum = modAdd(modAdd(modAdd(w0, w1), w2), row + 1);
    if (rowSum !== checksum) {
      rowFails.push(row);
      hasRowError = true;
    }
    checksumSum = modAdd(checksumSum, checksum as number);
  }

  for (let col = 0; col < 3; col++) {
    const columnChecksum = share.columnChecksumShares[col];
    if (!Number.isInteger(columnChecksum)) {
      continue;
    }
    let columnSum = 0;
    for (let row = 0; row < rowCount; row++) {
      columnSum = modAdd(columnSum, share.wordShares[row * WORDS_PER_ROW + col]);
    }
    if (modAdd(columnSum, COLUMN_TAGS[col]) !== columnChecksum) {
      colFails.push(col);
      hasColumnError = true;
    }
    columnChecksumSum = modAdd(columnChecksumSum, columnChecksum as number);
  }

  if (!Number.isInteger(share.globalIntegrityCheckShare)) {
    return { rowFails, colFails, gicFail };
  }

  const gic = share.globalIntegrityCheckShare as number;
  const fromWords = modAdd(
    modAdd(modAdd(wordSum, rowTotal), COLUMN_TOTAL),
    shareNumber
  );
  let gicOk = gic === fromWords;
  const allRows = share.checksumShares.every((v) => Number.isInteger(v));
  const allCols = share.columnChecksumShares.every((v) => Number.isInteger(v));
  if (allRows && !hasRowError) {
    const fromRows = modAdd(modAdd(checksumSum, COLUMN_TOTAL), shareNumber);
    gicOk = gicOk && gic === fromRows;
  }
  if (allCols && !hasColumnError) {
    const fromCols = modAdd(modAdd(columnChecksumSum, rowTotal), shareNumber);
    gicOk = gicOk && gic === fromCols;
  }
  if (!gicOk) {
    gicFail = true;
  }
  return { rowFails, colFails, gicFail };
}

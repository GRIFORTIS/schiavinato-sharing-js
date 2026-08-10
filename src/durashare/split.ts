/**
 * DuraShare - Split Function
 *
 * Share generation (splitting) for DuraShare over GF(2053), protocol v0.5.0.
 */

import { validateBip39Mnemonic } from '../bip39/validation.js';
import { wordToBip39Id } from '../bip39/lookup.js';
import { FIELD_PRIME, modAdd } from '../core/field.js';
import { randomPolynomial, evaluatePolynomial } from '../core/polynomial.js';
import {
  sanitizeMnemonic,
  ensureSupportedWordCount,
  WORDS_PER_ROW,
  COLUMN_TAGS
} from '../utils/validation.js';
import { clearSensitiveArray } from '../utils/security.js';
import {
  computeRowCheckPolynomials,
  computeColumnCheckPolynomials,
  computeGlobalIntegrityCheckPolynomial,
  computeRowTotal
} from './checksums.js';
import type { Share, SplitOptions, SplitResult } from '../types.js';

/**
 * Splits a BIP39 mnemonic into n Shamir shares with threshold k.
 *
 * v0.5.0: position-bound row checksums, column checksums (tags 10/20/30),
 * and printed GIC = (Σ words + rowTotal + 60 + X) mod 2053.
 * Dual-path Path A/B validation on rows, columns, and unbound GIC.
 *
 * @returns `{ shares }` — same envelope as the HTML tool
 */
export async function splitBip39(
  mnemonic: string,
  k: number,
  n: number,
  _options: SplitOptions = {}
): Promise<SplitResult> {
  if (!Number.isInteger(k) || !Number.isInteger(n)) {
    throw new Error('Threshold (k) and total shares (n) must be integers.');
  }

  if (k < 2) {
    throw new Error('Threshold k must be at least 2.');
  }

  if (k > n) {
    throw new Error('Threshold k cannot exceed n.');
  }

  if (n >= FIELD_PRIME) {
    throw new Error('Total shares (n) must be less than 2053.');
  }

  const normalizedMnemonic = sanitizeMnemonic(mnemonic);

  if (!validateBip39Mnemonic(normalizedMnemonic)) {
    throw new Error('Invalid BIP39 mnemonic: checksum verification failed.');
  }

  const words = normalizedMnemonic.split(' ');
  const wordCount = words.length;

  ensureSupportedWordCount(wordCount);

  const wordIndices = words.map((word) => wordToBip39Id(word));

  const degree = k - 1;

  const wordPolynomials = wordIndices.map((secret) =>
    randomPolynomial(secret, degree)
  );

  const rowCheckPolynomials = computeRowCheckPolynomials(wordPolynomials);
  const columnCheckPolynomials = computeColumnCheckPolynomials(wordPolynomials);
  const globalIntegrityCheckPolynomial =
    computeGlobalIntegrityCheckPolynomial(wordPolynomials);
  const rowCount = wordIndices.length / WORDS_PER_ROW;
  const rowTotal = computeRowTotal(rowCount);

  const shares: Share[] = [];

  try {
    for (let shareIndex = 1; shareIndex <= n; shareIndex++) {
      const share: Share = {
        shareNumber: shareIndex,
        wordShares: [],
        checksumShares: [],
        columnChecksumShares: [],
        globalIntegrityCheckShare: 0
      };

      for (const polynomial of wordPolynomials) {
        share.wordShares.push(evaluatePolynomial(polynomial, shareIndex));
      }

      for (let row = 0; row < rowCount; row++) {
        const base = row * WORDS_PER_ROW;

        const checksumPathA = modAdd(
          modAdd(
            modAdd(share.wordShares[base], share.wordShares[base + 1]),
            share.wordShares[base + 2]
          ),
          row + 1
        );

        const checksumPathB = evaluatePolynomial(
          rowCheckPolynomials[row],
          shareIndex
        );

        if (checksumPathA !== checksumPathB) {
          throw new Error(
            `Row checksum path mismatch at share ${shareIndex}, row ${row + 1}: ` +
              `Path A (sum)=${checksumPathA}, Path B (polynomial)=${checksumPathB}. ` +
              'This indicates a hardware fault or memory corruption during share generation.'
          );
        }

        share.checksumShares.push(checksumPathA);
      }

      for (let col = 0; col < 3; col++) {
        let columnPathA = 0;
        for (let row = 0; row < rowCount; row++) {
          columnPathA = modAdd(
            columnPathA,
            share.wordShares[row * WORDS_PER_ROW + col]
          );
        }
        columnPathA = modAdd(columnPathA, COLUMN_TAGS[col]);
        const columnPathB = evaluatePolynomial(
          columnCheckPolynomials[col],
          shareIndex
        );
        if (columnPathA !== columnPathB) {
          throw new Error(
            `Column checksum path mismatch at share ${shareIndex}, column ${col + 1}: ` +
              `Path A (sum)=${columnPathA}, Path B (polynomial)=${columnPathB}. ` +
              'This indicates a hardware fault or memory corruption during share generation.'
          );
        }
        share.columnChecksumShares.push(columnPathA);
      }

      const globalPathA = modAdd(
        modAdd(
          share.wordShares.reduce((acc, val) => modAdd(acc, val), 0),
          rowTotal
        ),
        60
      );
      const globalPathB = evaluatePolynomial(
        globalIntegrityCheckPolynomial,
        shareIndex
      );

      if (globalPathA !== globalPathB) {
        throw new Error(
          `Global integrity path mismatch at share ${shareIndex}: ` +
            `Path A (sum)=${globalPathA}, Path B (polynomial)=${globalPathB}. ` +
            'This indicates a hardware fault or memory corruption during share generation.'
        );
      }

      share.globalIntegrityCheckShare = modAdd(globalPathA, shareIndex);

      shares.push(share);
    }

    return { shares };
  } finally {
    clearSensitiveArray(wordIndices);
    wordPolynomials.forEach((poly) => clearSensitiveArray(poly));
    rowCheckPolynomials.forEach((poly) => clearSensitiveArray(poly));
    columnCheckPolynomials.forEach((poly) => clearSensitiveArray(poly));
    clearSensitiveArray(globalIntegrityCheckPolynomial);
  }
}

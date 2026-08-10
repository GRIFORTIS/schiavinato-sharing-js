/**
 * Property/Fuzz-style tests (bounded) using fast-check.
 *
 * NOTE: We bound number of runs to keep CI fast and deterministic.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { splitBip39, recoverAndValidate } from '../src/index';
import { computeRowChecks, computeGlobalIntegrityCheck } from '../src/durashare/checksums';

// Known valid BIP39 mnemonics (12 words) from test vectors
const validMnemonics = [
  'spin result brand ahead poet carpet unusual chronic denial festival toy autumn',
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  'legal winner thank year wave sausage worth useful legal winner thank yellow',
  'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong'
];

describe('Property-based tests (bounded)', () => {
  it('split/recover round-trip holds for random 12-word mnemonics (k<=n<=4)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...validMnemonics),
        fc.integer({ min: 2, max: 4 }), // n
        fc.integer({ min: 2, max: 3 }), // k (bounded to keep runtime small)
        async (mnemonic, n, k) => {
          if (k > n) return true; // skip invalid combos
          const { shares } = await splitBip39(mnemonic, k, n);

          // choose first k shares for recovery
          const subset = shares.slice(0, k);
          const result = await recoverAndValidate(subset, 12);

          return result.success && result.recoveredMnemonic === mnemonic;
        }
      ),
      { numRuns: 25 }
    );
  });

  it('checksum polynomials equal checksum sums at multiple x (Path A vs Path B)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...validMnemonics),
        fc.integer({ min: 2, max: 3 }),
        fc.integer({ min: 3, max: 5 }),
        async (mnemonic, k, n) => {
          if (k > n) return true;
          const { shares } = await splitBip39(mnemonic, k, n);

          // Build word polynomial evaluations from shares per x
          // Using shares themselves: for a given share index, wordShares are f_i(x_j)
          // We check that checksum polynomials evaluated at x_j equal sums of those wordShares.
          for (const share of shares) {
            const rowSums = computeRowChecks(share.wordShares);
            const globalSum = computeGlobalIntegrityCheck(share.wordShares);

            expect(share.checksumShares).toEqual(rowSums);

            // Printed GIC = (unbound + X) mod 2053
            const expectedGIC = (globalSum + share.shareNumber) % 2053;
            expect(share.globalIntegrityCheckShare).toBe(expectedGIC);
            expect(share.columnChecksumShares).toHaveLength(3);
          }

          return true;
        }
      ),
      { numRuns: 15 }
    );
  });
});

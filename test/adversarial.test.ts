/**
 * Adversarial and negative-path tests.
 */

import { describe, it, expect } from 'vitest';
import { recoverAndValidate, splitBip39 } from '../src/index';
import { indicesToMnemonic } from '../src/utils/seedGenerator';

describe('Adversarial / negative tests', () => {
  it('rejects shares with out-of-range values but correct structure', async () => {
    const mnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';
    const { shares } = await splitBip39(mnemonic, 2, 3);

    const bad = {
      ...shares[0],
      checksumShares: [...shares[0].checksumShares]
    };
    bad.checksumShares[0] = 2053; // out of GF(2053) range but structurally correct

    const result = await recoverAndValidate([bad, shares[1]], 12);
    expect(result.success).toBe(false);
    // Preflight audit catches mismatched row checksum before Lagrange range checks
    expect(
      result.errors.shareValidation !== null ||
        (result.errors.generic ?? '').includes('must be between 0 and 2052') ||
        (result.errors.generic ?? '').includes('Row checksum mismatch')
    ).toBe(true);
  });

  it('rejects shares with mismatched word counts', async () => {
    const mnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';
    const { shares } = await splitBip39(mnemonic, 2, 3);

    const malformed = {
      ...shares[0],
      wordShares: shares[0].wordShares.slice(0, 6) // wrong length
    };

    const result = await recoverAndValidate([malformed, shares[1]], 12);
    expect(result.success).toBe(false);
    expect(result.errors.generic).toContain('does not contain 12 word values');
  });

  it('rejects duplicate share numbers across different splits', async () => {
    const mnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';
    const { shares: sharesA } = await splitBip39(mnemonic, 2, 3);
    const { shares: sharesB } = await splitBip39(mnemonic, 2, 3);

    // Use share #1 from both splits; X duplicates should fail
    const result = await recoverAndValidate([sharesA[0], sharesB[0]], 12);
    expect(result.success).toBe(false);
    expect(result.errors.generic).toContain('Duplicate share numbers');
  });

  it('rejects mixed threshold parameters (k>n) at split time', async () => {
    await expect(splitBip39('spin result brand ahead poet carpet unusual chronic denial festival toy autumn', 4, 3))
      .rejects.toThrow('Threshold k cannot exceed n');
  });

  it('accepts supported 15-word mnemonics', async () => {
    const { generateBip39Mnemonic } = await import('../src/bip39/generate');
    const mnemonic = generateBip39Mnemonic(15);
    const { shares } = await splitBip39(mnemonic, 2, 3);
    expect(shares).toHaveLength(3);
    const result = await recoverAndValidate([shares[0], shares[1]], 15);
    expect(result.success).toBe(true);
    expect(result.recoveredMnemonic).toBe(mnemonic);
  });
});

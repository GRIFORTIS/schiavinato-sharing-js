/**
 * Adversarial and negative-path tests.
 */

import { describe, it, expect } from 'vitest';
import { recoverMnemonic, splitMnemonic } from '../src/index';
import { englishWordlist } from '@scure/bip39/wordlists/english';
import { indicesToMnemonic } from '../src/utils/seedGenerator';

describe('Adversarial / negative tests', () => {
  it('rejects shares with out-of-range values but correct structure', async () => {
    const mnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';
    const shares = await splitMnemonic(mnemonic, 2, 3);

    const bad = {
      ...shares[0],
      checksumShares: [...shares[0].checksumShares]
    };
    bad.checksumShares[0] = 2053; // out of GF(2053) range but structurally correct

    const result = await recoverMnemonic([bad, shares[1]], 12);
    expect(result.success).toBe(false);
    expect(result.errors.generic).toContain('must be between 0 and 2052');
  });

  it('rejects shares with mismatched word counts', async () => {
    const mnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';
    const shares = await splitMnemonic(mnemonic, 2, 3);

    const malformed = {
      ...shares[0],
      wordShares: shares[0].wordShares.slice(0, 6) // wrong length
    };

    const result = await recoverMnemonic([malformed, shares[1]], 12);
    expect(result.success).toBe(false);
    expect(result.errors.generic).toContain('does not contain 12 word values');
  });

  it('rejects duplicate share numbers across different splits', async () => {
    const mnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';
    const sharesA = await splitMnemonic(mnemonic, 2, 3);
    const sharesB = await splitMnemonic(mnemonic, 2, 3);

    // Use share #1 from both splits; X duplicates should fail
    const result = await recoverMnemonic([sharesA[0], sharesB[0]], 12);
    expect(result.success).toBe(false);
    expect(result.errors.generic).toContain('Duplicate share numbers');
  });

  it('rejects mixed threshold parameters (k>n) at split time', async () => {
    await expect(splitMnemonic('spin result brand ahead poet carpet unusual chronic denial festival toy autumn', 4, 3))
      .rejects.toThrow('Threshold k cannot exceed n');
  });

  it('rejects unsupported word counts', async () => {
    const mnemonic = 'letter advice cage absurd amount doctor acoustic avoid letter advice cage absurd amount doctor theft'; // valid 15-word BIP39
    await expect(splitMnemonic(mnemonic, 2, 3)).rejects.toThrow(/(supports only 12- or 24-word|Invalid BIP39 mnemonic)/);
  });
});

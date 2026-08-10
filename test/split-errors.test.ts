/**
 * Split error path coverage for k/n and n bounds.
 */

import { describe, it, expect } from 'vitest';
import { splitBip39 } from '../src/index';

const mnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';

describe('splitBip39 error paths', () => {
  it('rejects k < 2', async () => {
    await expect(splitBip39(mnemonic, 1, 3)).rejects.toThrow('Threshold k must be at least 2.');
  });

  it('rejects k > n', async () => {
    await expect(splitBip39(mnemonic, 4, 3)).rejects.toThrow('Threshold k cannot exceed n.');
  });

  it('rejects n >= FIELD_PRIME', async () => {
    await expect(splitBip39(mnemonic, 2, 2053)).rejects.toThrow('Total shares (n) must be less than 2053.');
  });
});

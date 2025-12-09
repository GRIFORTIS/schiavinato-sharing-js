/**
 * Split error path coverage for k/n and n bounds.
 */

import { describe, it, expect } from 'vitest';
import { splitMnemonic } from '../src/index';

const mnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';

describe('splitMnemonic error paths', () => {
  it('rejects k < 2', async () => {
    await expect(splitMnemonic(mnemonic, 1, 3)).rejects.toThrow('Threshold k must be at least 2.');
  });

  it('rejects k > n', async () => {
    await expect(splitMnemonic(mnemonic, 4, 3)).rejects.toThrow('Threshold k cannot exceed n.');
  });

  it('rejects n >= FIELD_PRIME', async () => {
    await expect(splitMnemonic(mnemonic, 2, 2053)).rejects.toThrow('Total shares (n) must be less than 2053.');
  });
});

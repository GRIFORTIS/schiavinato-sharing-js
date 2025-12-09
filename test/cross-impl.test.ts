/**
 * Cross-implementation regression: ensure deterministic shares match reference fixture.
 */

import { describe, it, expect } from 'vitest';
import { splitMnemonic, configureRandomSource } from '../src/index';
import reference from './fixtures/reference-shares.json';

describe('Cross-implementation regression', () => {
  it('matches reference shares for canonical test vector', async () => {
    const { mnemonic, k, n, shares: expected } = reference;

    // Deterministic RNG for reproducible shares
    let counter = 0;
    configureRandomSource({
      getRandomValues(arr: Uint32Array) {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = counter++;
        }
      }
    });

    const shares = await splitMnemonic(mnemonic, k, n);

    expect(shares).toEqual(expected);

    // Restore crypto-based randomness
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto');
    configureRandomSource({
      getRandomValues(array: Uint32Array) {
        crypto.randomFillSync(array);
      }
    });
  });
});

/**
 * Edge-case mnemonics (all zero, all max).
 */

import { describe, it, expect } from 'vitest';
import { splitMnemonic, recoverMnemonic } from '../src/index';

describe('Edge mnemonics', () => {
  it('splits and recovers low-entropy 24-word mnemonic (BIP39 zero entropy vector)', async () => {
    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art';
    const shares = await splitMnemonic(mnemonic, 3, 5);
    const result = await recoverMnemonic([shares[0], shares[2], shares[4]], 24);
    expect(result.success).toBe(true);
    expect(result.mnemonic).toBe(mnemonic);
  });

  it('splits and recovers high-entropy 24-word mnemonic (BIP39 max entropy vector)', async () => {
    const mnemonic =
      'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo vote';
    const shares = await splitMnemonic(mnemonic, 3, 5);
    const result = await recoverMnemonic([shares[1], shares[2], shares[3]], 24);
    expect(result.success).toBe(true);
    expect(result.mnemonic).toBe(mnemonic);
  });
});

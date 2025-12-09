/**
 * Validation utilities coverage for error branches.
 */

import { describe, it, expect } from 'vitest';
import { sanitizeMnemonic, ensureSupportedWordCount, normalizeShareValue, validateSharesForRecovery, ensureShareNumbersDistinct, WORDS_PER_ROW } from '../src/utils/validation';
import type { ShareData } from '../src/types';

describe('Validation utilities', () => {
  it('rejects non-string or empty mnemonics', () => {
    // @ts-expect-error intentional misuse
    expect(() => sanitizeMnemonic(123)).toThrow('Mnemonic must be a string');
    expect(() => sanitizeMnemonic('   ')).toThrow('Mnemonic cannot be empty.');
  });

  it('rejects unsupported word counts', () => {
    expect(() => ensureSupportedWordCount(15)).toThrow('supports only 12- or 24-word');
  });

  it('validates share values are within GF(2053)', () => {
    expect(() => normalizeShareValue(2053, 'test')).toThrow('must be between 0 and 2052');
    expect(() => normalizeShareValue(-1, 'test')).toThrow('must be between 0 and 2052');
  });

  it('validates share structure and detects missing fields', () => {
    const bad: ShareData = {
      // @ts-expect-error intentional bad number
      shareNumber: 0,
      wordShares: new Array(12).fill(1),
      checksumShares: new Array(12 / WORDS_PER_ROW).fill(1),
      // @ts-expect-error intentional omission
      globalChecksumVerificationShare: undefined
    };
    expect(() => validateSharesForRecovery([bad], 12)).toThrow('missing a valid share number');
  });

  it('validates checksum length', () => {
    const bad: ShareData = {
      shareNumber: 1,
      wordShares: new Array(12).fill(1),
      checksumShares: [], // wrong length
      globalChecksumVerificationShare: 1
    };
    expect(() => validateSharesForRecovery([bad], 12)).toThrow('does not contain 4 checksum values');
  });

  it('detects duplicate share numbers', () => {
    const s1: ShareData = {
      shareNumber: 1,
      wordShares: new Array(12).fill(1),
      checksumShares: new Array(4).fill(1),
      globalChecksumVerificationShare: 1
    };
    const s2 = { ...s1 };
    expect(() => ensureShareNumbersDistinct([s1, s2])).toThrow('Duplicate share numbers detected.');
  });
});

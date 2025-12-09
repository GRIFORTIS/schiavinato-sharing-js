/**
 * Randomness utilities negative/edge coverage.
 */

import { describe, it, expect } from 'vitest';
import { configureRandomSource, getRandomIntInclusive, getRandomFieldElement } from '../src/utils/random';

describe('Random utilities', () => {
  it('throws when random source is missing', () => {
    // Force a bad random source
    // @ts-expect-error testing invalid source
    expect(() => configureRandomSource({ getRandomValues: undefined })).toThrow('randomSource must expose getRandomValues');
  });

  it('throws when getRandomValues fails', () => {
    configureRandomSource({
      getRandomValues() {
        throw new Error('RNG failed');
      }
    });
    expect(() => getRandomIntInclusive(5)).toThrow('RNG failed');
  });

  it('throws on invalid range', () => {
    expect(() => getRandomIntInclusive(-1)).toThrow('Invalid range for randomness.');
  });

  it('returns values in range', () => {
    configureRandomSource({
      getRandomValues(arr: Uint32Array) {
        arr[0] = 3;
      }
    });
    const val = getRandomIntInclusive(5);
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThanOrEqual(5);
    expect(typeof getRandomFieldElement()).toBe('number');
  });
});

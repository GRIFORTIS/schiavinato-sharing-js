/**
 * Timing/side-channel harness (skipped in CI).
 * Run manually with: npm test -- --include test/timing.test.ts
 */

import { describe, it, expect } from 'vitest';
import { constantTimeEqual, constantTimeStringEqual } from '../src/utils/security';

function time(fn: () => void, iterations: number): number {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  return performance.now() - start;
}

describe('Timing harness (manual)', () => {
  it('constantTimeEqual shows similar timing for equal vs different values', () => {
    const iterations = 50000;
    const tEqual = time(() => constantTimeEqual(1234, 1234), iterations);
    const tDiff = time(() => constantTimeEqual(1234, 1235), iterations);

    const ratio = tEqual / tDiff;
    // Allow generous variance; we only care they are on the same order
    expect(ratio).toBeGreaterThan(0.5);
    expect(ratio).toBeLessThan(4.0);
  });

  it('constantTimeStringEqual shows similar timing for equal vs different strings', () => {
    const iterations = 20000;
    const a = '0110110011001100';
    const b = '0110110011001100';
    const c = '0110110011001101';

    const tEqual = time(() => constantTimeStringEqual(a, b), iterations);
    const tDiff = time(() => constantTimeStringEqual(a, c), iterations);

    const ratio = tEqual / tDiff;
    expect(ratio).toBeGreaterThan(0.5);
    expect(ratio).toBeLessThan(4.0);
  });
});

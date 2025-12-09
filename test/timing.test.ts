/**
 * Timing/side-channel harness (skipped in CI).
 * Run manually with: npm test -- --include test/timing.test.ts
 */

import { describe, it, expect } from 'vitest';
import { constantTimeEqual, constantTimeStringEqual } from '../src/utils/security';

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function runTrials(fn: () => void, iterations: number, trials: number): number {
  const results: number[] = [];
  for (let t = 0; t < trials; t++) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) fn();
    results.push(performance.now() - start);
  }
  return median(results);
}

describe('Timing harness (manual)', () => {
  it('constantTimeEqual shows similar timing for equal vs different values', () => {
    const iterations = 50000;
    const trials = 5; // reduce jitter sensitivity
    const tEqual = runTrials(() => constantTimeEqual(1234, 1234), iterations, trials);
    const tDiff = runTrials(() => constantTimeEqual(1234, 1235), iterations, trials);

    const ratio = tEqual / tDiff;
    expect(ratio).toBeGreaterThan(0.2);
    expect(ratio).toBeLessThan(6.0);
  });

  it('constantTimeStringEqual shows similar timing for equal vs different strings', () => {
    const iterations = 20000;
    const trials = 5;
    const a = '0110110011001100';
    const b = '0110110011001100';
    const c = '0110110011001101';

    const tEqual = runTrials(() => constantTimeStringEqual(a, b), iterations, trials);
    const tDiff = runTrials(() => constantTimeStringEqual(a, c), iterations, trials);

    const ratio = tEqual / tDiff;
    expect(ratio).toBeGreaterThan(0.2);
    expect(ratio).toBeLessThan(6.0);
  });
});

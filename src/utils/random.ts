/**
 * Cryptographically Secure Random Number Generation
 * 
 * This module provides secure random number generation using Web Crypto API
 * in browsers or Node.js crypto module.
 */

import { FIELD_PRIME } from '../core/field.js';
import type { RandomSource } from '../types.js';

// Detect runtime environment and set up random source
const globalScope = typeof globalThis !== 'undefined' 
  ? globalThis 
  : (typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : {}));

let randomSource: RandomSource | null = null;

// Try to use Web Crypto API
if (typeof globalScope === 'object' && 'crypto' in globalScope && globalScope.crypto) {
  const crypto = (globalScope as Record<string, unknown>).crypto;
  if (crypto && typeof (crypto as Record<string, unknown>).getRandomValues === 'function') {
    randomSource = crypto as unknown as RandomSource;
  }
}

// In Node.js, if Web Crypto is not available, try to import crypto using dynamic import
if (!randomSource) {
  try {
    // This will be tree-shaken in browser builds
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = typeof require !== 'undefined' ? require('crypto') : null;
    if (crypto && crypto.randomFillSync) {
      randomSource = {
        getRandomValues(array: Uint32Array) {
          crypto.randomFillSync(array);
        }
      };
    }
  } catch (e) {
    // Ignore - will throw error when trying to use
  }
}

/**
 * Configures the random source (useful for testing or non-standard environments).
 * 
 * @param source - An object with a getRandomValues method
 * @throws {Error} If the source doesn't have a valid getRandomValues method
 * 
 * @example
 * // For testing with deterministic random values
 * configureRandomSource({
 *   getRandomValues(array) {
 *     // Fill with deterministic values
 *     for (let i = 0; i < array.length; i++) {
 *       array[i] = 42;
 *     }
 *   }
 * });
 */
export function configureRandomSource(source: RandomSource): void {
  if (!source || typeof source.getRandomValues !== 'function') {
    throw new Error('randomSource must expose getRandomValues(Uint32Array).');
  }
  randomSource = source;
}

/**
 * Returns a uniform random integer in [0, max] using cryptographically secure entropy.
 * 
 * Uses rejection sampling to ensure uniform distribution without modulo bias.
 * 
 * @param max - The maximum value (inclusive)
 * @returns A random integer in the range [0, max]
 * @throws {Error} If secure randomness is not available or max is invalid
 * 
 * @example
 * getRandomIntInclusive(2052) // Returns random value 0-2052
 * getRandomIntInclusive(10) // Returns random value 0-10
 */
export function getRandomIntInclusive(max: number): number {
  if (!randomSource || typeof randomSource.getRandomValues !== 'function') {
    throw new Error('Secure randomness provider is not configured. Web Crypto API or Node.js crypto is required.');
  }
  
  const range = max + 1;
  
  if (range <= 0) {
    throw new Error('Invalid range for randomness.');
  }
  
  const maxUint32 = 0x100000000;
  const limit = maxUint32 - (maxUint32 % range);
  const buffer = new Uint32Array(1);
  
  let value: number;
  
  // Rejection sampling to avoid modulo bias
  do {
    randomSource.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  
  return value % range;
}

/**
 * Draws a random element from GF(2053).
 * 
 * Returns a random integer in the range [0, 2052], suitable for use
 * as a field element or polynomial coefficient.
 * 
 * @returns A random field element
 * @throws {Error} If secure randomness is not available
 * 
 * @example
 * getRandomFieldElement() // Returns random value 0-2052
 * getRandomFieldElement() // Each call is independent and uniform
 */
export function getRandomFieldElement(): number {
  return getRandomIntInclusive(FIELD_PRIME - 1);
}


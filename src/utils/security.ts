/**
 * Security Utilities
 * 
 * This module provides security-hardened utility functions to prevent
 * timing attacks and memory dump vulnerabilities.
 * 
 * ## Constant-Time Guarantees
 * 
 * The constant-time comparison functions in this module are designed to prevent
 * timing side-channel attacks. Their constant-time properties are guaranteed by
 * construction, not empirical testing:
 * 
 * - Uses only constant-time primitives (XOR, OR, AND)
 * - No conditional branching on secret data
 * - Fixed iteration counts independent of input values
 * 
 * This approach matches Bitcoin Core's security model: constant-time by design,
 * verified through code review and static analysis, not runtime measurements.
 * 
 * JavaScript's timing APIs (performance.now()) are too coarse and variable to
 * reliably validate constant-time properties empirically. JIT optimization, OS
 * scheduling, and garbage collection introduce noise that exceeds typical timing
 * differences from side-channel vulnerabilities.
 */

/**
 * Constant-time equality comparison for field elements.
 * 
 * Uses bitwise XOR to compare values without early exit, preventing
 * timing attacks that could leak information about secret values through
 * execution time differences.
 * 
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns true if values are equal, false otherwise
 * 
 * @example
 * // Safe comparison that takes constant time regardless of values
 * if (constantTimeEqual(recoveredChecksum, expectedChecksum)) {
 *   console.log('Checksum valid');
 * }
 */
export function constantTimeEqual(a: number, b: number): boolean {
  // XOR returns 0 only if both values are identical
  // This comparison happens in constant time regardless of where bits differ
  const diff = a ^ b;
  return diff === 0;
}

/**
 * Constant-time string equality comparison.
 * 
 * Compares two strings character by character without early exit,
 * preventing timing attacks on string comparisons (e.g., BIP39 checksums).
 * 
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal, false otherwise
 * 
 * @example
 * // Safe comparison for binary strings
 * if (constantTimeStringEqual(derivedChecksum, checksumBinary)) {
 *   console.log('BIP39 checksum valid');
 * }
 */
export function constantTimeStringEqual(a: string, b: string): boolean {
  // If lengths differ, they can't be equal - but still check all chars
  // to maintain constant time relative to max length
  const maxLen = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  
  for (let i = 0; i < maxLen; i++) {
    const charA = i < a.length ? a.charCodeAt(i) : 0;
    const charB = i < b.length ? b.charCodeAt(i) : 0;
    diff |= charA ^ charB;
  }
  
  return diff === 0;
}

/**
 * Securely overwrites an array with zeros.
 * 
 * This function attempts to prevent sensitive data from remaining in memory
 * by explicitly overwriting array contents. While JavaScript's garbage collector
 * will eventually reclaim memory, this reduces the window of vulnerability to
 * memory dump attacks.
 * 
 * @param arr - Array to wipe (will be modified in place)
 * 
 * @example
 * const secretKeys = [1679, 456, 892];
 * // ... use the keys ...
 * secureWipeArray(secretKeys); // Now [0, 0, 0]
 */
export function secureWipeArray(arr: number[]): void {
  if (Array.isArray(arr)) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = 0;
    }
  }
}

/**
 * Securely wipes a number variable (returns 0).
 * 
 * Helper function to explicitly clear a number variable.
 * 
 * @param _value - Value to clear (unused, parameter for clarity)
 * @returns 0
 * 
 * @example
 * let secretValue = 1679;
 * // ... use the value ...
 * secretValue = secureWipeNumber(secretValue); // Now 0
 */
export function secureWipeNumber(_value: number): number {
  return 0;
}

/**
 * Attempts to overwrite a string variable by reassigning it to zeros.
 * 
 * Note: JavaScript strings are immutable, so this has limited effectiveness.
 * The original string may remain in memory until garbage collected, but this
 * reduces the window of vulnerability by breaking the reference.
 * 
 * @param str - The string to wipe
 * @returns A zeroed-out string of the same length
 * 
 * @example
 * let mnemonic = 'abandon abandon abandon...';
 * // ... use mnemonic ...
 * mnemonic = wipeString(mnemonic); // Now '\0\0\0...'
 */
export function wipeString(str: string): string {
  if (typeof str === 'string' && str.length > 0) {
    return '\0'.repeat(str.length);
  }
  return '';
}


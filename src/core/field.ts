/**
 * Galois Field GF(2053) Arithmetic
 * 
 * This module implements the core field arithmetic operations for Schiavinato Sharing.
 * All operations are performed modulo the prime 2053.
 * 
 * The prime 2053 was chosen because:
 * - It's larger than 2048 (BIP39 wordlist size)
 * - It's small enough for mental arithmetic
 * - It allows for compact share representations
 */

/** The prime modulus for the Galois field GF(2053) */
export const FIELD_PRIME = 2053;

/**
 * Reduces an integer into GF(2053) by applying modulo with wraparound for negatives.
 * 
 * @param value - The integer value to reduce
 * @returns The value reduced into the range [0, 2052]
 * 
 * @example
 * mod(2055) // Returns 2
 * mod(-1) // Returns 2052
 * mod(2053) // Returns 0
 */
export function mod(value: number): number {
  const result = value % FIELD_PRIME;
  return result < 0 ? result + FIELD_PRIME : result;
}

/**
 * Adds two field elements and returns the result modulo 2053.
 * 
 * @param a - First field element
 * @param b - Second field element
 * @returns (a + b) mod 2053
 * 
 * @example
 * modAdd(2000, 100) // Returns 47
 * modAdd(1000, 500) // Returns 1500
 */
export function modAdd(a: number, b: number): number {
  return mod(a + b);
}

/**
 * Subtracts the second field element from the first inside GF(2053).
 * 
 * @param a - First field element (minuend)
 * @param b - Second field element (subtrahend)
 * @returns (a - b) mod 2053
 * 
 * @example
 * modSub(100, 200) // Returns 1953
 * modSub(1500, 500) // Returns 1000
 */
export function modSub(a: number, b: number): number {
  return mod(a - b);
}

/**
 * Multiplies two field elements and reduces the product into GF(2053).
 * 
 * @param a - First field element
 * @param b - Second field element
 * @returns (a * b) mod 2053
 * 
 * @example
 * modMul(100, 50) // Returns 5000 mod 2053 = 841
 * modMul(2, 1026) // Returns 2052
 */
export function modMul(a: number, b: number): number {
  return mod(a * b);
}

/**
 * Computes the multiplicative inverse of a non-zero field element.
 * Uses the Extended Euclidean Algorithm.
 * 
 * @param value - The field element to invert (must be non-zero)
 * @returns The multiplicative inverse: value * result ≡ 1 (mod 2053)
 * @throws {Error} If value is 0 or not invertible
 * 
 * @example
 * modInv(2) // Returns 1027 (because 2 * 1027 ≡ 1 mod 2053)
 * modInv(1027) // Returns 2
 */
export function modInv(value: number): number {
  const val = mod(value);
  
  if (val === 0) {
    throw new Error('Attempted to invert zero in GF(2053).');
  }
  
  let t = 0;
  let newT = 1;
  let r = FIELD_PRIME;
  let newR = val;
  
  while (newR !== 0) {
    const quotient = Math.floor(r / newR);
    [t, newT] = [newT, t - quotient * newT];
    [r, newR] = [newR, r - quotient * newR];
  }
  
  if (r > 1) {
    throw new Error('Value is not invertible in GF(2053).');
  }
  
  if (t < 0) {
    t += FIELD_PRIME;
  }
  
  return t;
}


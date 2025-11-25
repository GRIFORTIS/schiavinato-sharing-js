/**
 * Lagrange Interpolation in GF(2053)
 * 
 * This module implements Lagrange interpolation for secret reconstruction
 * in Shamir's Secret Sharing over the finite field GF(2053).
 */

import { mod, modAdd, modSub, modMul, modInv, FIELD_PRIME } from './field.js';
import { normalizeShareValue } from '../utils/validation.js';
import type { Point } from '../types.js';

/**
 * Applies Lagrange interpolation at x=0 to recover the secret from share points.
 * 
 * For points (x₁,y₁), (x₂,y₂), ..., (xₖ,yₖ), computes:
 * 
 * f(0) = Σⱼ yⱼ · Lⱼ(0)
 * 
 * where Lⱼ(0) is the Lagrange basis polynomial evaluated at x=0:
 * 
 * Lⱼ(0) = ∏ₘ≠ⱼ (0 - xₘ) / (xⱼ - xₘ) = ∏ₘ≠ⱼ (-xₘ) / (xⱼ - xₘ)
 * 
 * @param points - Array of (x,y) coordinate pairs
 * @returns The secret value f(0)
 * @throws {Error} If points array is empty or interpolation fails
 * 
 * @example
 * // Recover secret from 2 shares
 * lagrangeInterpolateAtZero([
 *   { x: 1, y: 82 },
 *   { x: 2, y: 538 }
 * ]) // Returns 1679 (the original secret)
 */
export function lagrangeInterpolateAtZero(points: Point[]): number {
  if (!Array.isArray(points) || points.length === 0) {
    throw new Error('Interpolation requires at least one point.');
  }
  
  let sum = 0;
  
  for (let j = 0; j < points.length; j++) {
    let numerator = 1;
    let denominator = 1;
    
    const xj = mod(points[j].x);
    const yj = mod(points[j].y);
    
    // Compute the Lagrange basis polynomial Lⱼ(0)
    for (let m = 0; m < points.length; m++) {
      if (m === j) continue;
      
      const xm = mod(points[m].x);
      
      // Numerator: ∏ₘ≠ⱼ (0 - xₘ) = ∏ₘ≠ⱼ (-xₘ)
      numerator = modMul(numerator, mod(FIELD_PRIME - xm));
      
      // Denominator: ∏ₘ≠ⱼ (xⱼ - xₘ)
      denominator = modMul(denominator, modSub(xj, xm));
    }
    
    // Compute yⱼ · Lⱼ(0) = yⱼ · (numerator / denominator)
    const term = modMul(yj, modMul(numerator, modInv(denominator)));
    sum = modAdd(sum, term);
  }
  
  return sum;
}

/**
 * Computes the Lagrange multipliers (λ) for the provided share numbers at X=0.
 * 
 * These multipliers can be pre-computed and used for manual recovery:
 * secret = λ₁·y₁ + λ₂·y₂ + ... + λₖ·yₖ (mod 2053)
 * 
 * For share numbers x₁, x₂, ..., xₖ, the multiplier for share i is:
 * 
 * λᵢ = ∏ⱼ≠ᵢ (0 - xⱼ) / (xᵢ - xⱼ) = ∏ⱼ≠ᵢ (-xⱼ) / (xᵢ - xⱼ)
 * 
 * @param shareNumbers - Array of share numbers (X coordinates)
 * @returns Array of Lagrange multipliers in the same order as shareNumbers
 * @throws {Error} If share numbers are invalid, duplicate, or contain zero
 * 
 * @example
 * // Compute multipliers for shares {1, 2}
 * computeLagrangeMultipliers([1, 2]) // Returns [2, 2052]
 * 
 * // Compute multipliers for shares {1, 3}
 * computeLagrangeMultipliers([1, 3]) // Returns [1028, 1026]
 * 
 * // Then use these to recover: secret = (2 * share1 + 2052 * share2) mod 2053
 */
export function computeLagrangeMultipliers(shareNumbers: number[]): number[] {
  if (!Array.isArray(shareNumbers) || shareNumbers.length < 2) {
    throw new Error('At least two share numbers are required to compute multipliers.');
  }
  
  // Normalize and validate share numbers
  const normalized = shareNumbers.map((value, index) => 
    normalizeShareValue(value, `Share number ${index + 1}`)
  );
  
  // Check for duplicates and zeros
  const seen = new Set<number>();
  normalized.forEach((value) => {
    if (value === 0) {
      throw new Error('Share numbers cannot be zero.');
    }
    if (seen.has(value)) {
      throw new Error('Share numbers must be unique.');
    }
    seen.add(value);
  });
  
  const multipliers: number[] = [];
  
  for (let i = 0; i < normalized.length; i++) {
    let numerator = 1;
    let denominator = 1;
    
    const xi = mod(normalized[i]);
    
    for (let j = 0; j < normalized.length; j++) {
      if (i === j) continue;
      
      const xj = mod(normalized[j]);
      
      // Numerator: ∏ⱼ≠ᵢ (0 - xⱼ) = ∏ⱼ≠ᵢ (-xⱼ)
      numerator = modMul(numerator, mod(FIELD_PRIME - xj));
      
      // Denominator: ∏ⱼ≠ᵢ (xᵢ - xⱼ)
      denominator = modMul(denominator, modSub(xi, xj));
    }
    
    multipliers.push(modMul(numerator, modInv(denominator)));
  }
  
  return multipliers;
}


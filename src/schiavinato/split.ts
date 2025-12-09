/**
 * Schiavinato Sharing - Split Function
 * 
 * This module implements the share generation (splitting) logic for
 * Schiavinato Sharing over GF(2053).
 */

import { validateMnemonic as validateBip39 } from '@scure/bip39';
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english';
import { FIELD_PRIME, modAdd } from '../core/field.js';
import { randomPolynomial, evaluatePolynomial } from '../core/polynomial.js';
import { sanitizeMnemonic, ensureSupportedWordCount, WORDS_PER_ROW } from '../utils/validation.js';
import { secureWipeArray } from '../utils/security.js';
import { computeRowCheckPolynomials, computeGlobalCheckPolynomial } from './checksums.js';
import type { Share, SplitOptions } from '../types.js';

/**
 * Splits a BIP39 mnemonic into n Shamir shares with threshold k.
 * 
 * Implements the Schiavinato Sharing scheme (v0.4.0):
 * 1. Validates the BIP39 mnemonic
 * 2. Converts words to indices (0-2047)
 * 3. Creates degree-(k-1) polynomials for word secrets
 * 4. Evaluates word polynomials at x = 1, 2, ..., n
 * 5. Computes checksum shares using dual-path validation:
 *    - Path A: Sum of word shares (mod 2053) - direct computation
 *    - Path B: Polynomial-based - sum polynomial coefficients, then evaluate
 * 
 * v0.4.0 Change: Implements dual-path checksum validation to detect bit flips
 * and hardware faults. Checksum polynomials are created by summing word polynomial
 * coefficients, then evaluated at each share point. Both paths must agree, providing
 * redundant validation that catches corruption during share generation.
 * 
 * v0.3.0 Change: Checksum shares are now computed deterministically during share
 * generation, enabling integrity validation during manual splitting. Row checksum
 * share = sum of 3 word shares in that row. Global checksum share = sum of all
 * word shares. This maintains all LSSS security properties while adding verifiability.
 * 
 * @param mnemonic - The BIP39 mnemonic phrase to split
 * @param k - Threshold: number of shares required for recovery (minimum 2)
 * @param n - Total number of shares to generate
 * @param options - Optional configuration (custom wordlist)
 * @returns Array of n share objects
 * @throws {Error} If inputs are invalid or mnemonic fails validation
 * 
 * @example
 * const shares = await splitMnemonic(
 *   'spin result brand ahead poet carpet unusual chronic denial festival toy autumn',
 *   2,  // 2-of-n
 *   3   // 3 total shares
 * );
 * 
 * // Returns 3 shares, any 2 can recover the original mnemonic
 * // shares[0] = { shareNumber: 1, wordShares: [...], checksumShares: [...], globalChecksumVerificationShare: ... }
 * // shares[1] = { shareNumber: 2, ... }
 * // shares[2] = { shareNumber: 3, ... }
 */
export async function splitMnemonic(
  mnemonic: string,
  k: number,
  n: number,
  options: SplitOptions = {}
): Promise<Share[]> {
  // Validate parameters
  if (!Number.isInteger(k) || !Number.isInteger(n)) {
    throw new Error('Threshold (k) and total shares (n) must be integers.');
  }
  
  if (k < 2) {
    throw new Error('Threshold k must be at least 2.');
  }
  
  if (k > n) {
    throw new Error('Threshold k cannot exceed n.');
  }
  
  if (n >= FIELD_PRIME) {
    throw new Error('Total shares (n) must be less than 2053.');
  }
  
  // Normalize and validate mnemonic
  const normalizedMnemonic = sanitizeMnemonic(mnemonic);
  const wordlist = options.wordlist || englishWordlist;
  
  // Validate BIP39 checksum
  if (!validateBip39(normalizedMnemonic, wordlist)) {
    throw new Error('Invalid BIP39 mnemonic: checksum verification failed.');
  }
  
  // Split into words
  const words = normalizedMnemonic.split(' ');
  const wordCount = words.length;
  
  ensureSupportedWordCount(wordCount);
  
  // Convert words to indices
  const wordIndices = words.map((word) => {
    const index = wordlist.indexOf(word);
    if (index === -1) {
      throw new Error(`Unknown mnemonic word: "${word}".`);
    }
    return index;
  });
  
  // Create polynomials (degree = k - 1)
  const degree = k - 1;
  
  const wordPolynomials = wordIndices.map((secret) => 
    randomPolynomial(secret, degree)
  );
  
  // v0.4.0: Compute checksum polynomials (Path B)
  // These are created by summing word polynomial coefficients
  const rowCheckPolynomials = computeRowCheckPolynomials(wordPolynomials);
  const globalCheckPolynomial = computeGlobalCheckPolynomial(wordPolynomials);
  
  // Generate shares by evaluating polynomials at x = 1, 2, ..., n
  const shares: Share[] = [];
  
  try {
    for (let shareIndex = 1; shareIndex <= n; shareIndex++) {
      const share: Share = {
        shareNumber: shareIndex,
        wordShares: [],
        checksumShares: [],
        globalChecksumVerificationShare: 0
      };
      
      // Evaluate word polynomials
      for (const polynomial of wordPolynomials) {
        share.wordShares.push(evaluatePolynomial(polynomial, shareIndex));
      }
      
      // v0.4.0: Dual-path checksum validation
      // Path A: Direct sum of word shares (original v0.3.0 method)
      // Path B: Evaluate checksum polynomials (new v0.4.0 method)
      // Both paths must agree to detect bit flips and hardware faults
      
      const rowCount = wordIndices.length / WORDS_PER_ROW;
      
      // Calculate row checksum shares using both paths
      for (let row = 0; row < rowCount; row++) {
        const base = row * WORDS_PER_ROW;
        
        // Path A: Sum of word shares
        const checksumPathA = modAdd(
          modAdd(share.wordShares[base], share.wordShares[base + 1]),
          share.wordShares[base + 2]
        );
        
        // Path B: Evaluate row checksum polynomial
        const checksumPathB = evaluatePolynomial(rowCheckPolynomials[row], shareIndex);
        
        // Validate paths agree
        if (checksumPathA !== checksumPathB) {
          throw new Error(
            `Row checksum path mismatch at share ${shareIndex}, row ${row + 1}: ` +
            `Path A (sum)=${checksumPathA}, Path B (polynomial)=${checksumPathB}. ` +
            `This indicates a hardware fault or memory corruption during share generation.`
          );
        }
        
        share.checksumShares.push(checksumPathA);
      }
      
      // Calculate global checksum share using both paths
      // Path A: Sum of all word shares
      const globalPathA = share.wordShares.reduce((acc, val) => modAdd(acc, val), 0);
      
      // Path B: Evaluate global checksum polynomial
      const globalPathB = evaluatePolynomial(globalCheckPolynomial, shareIndex);
      
      // Validate paths agree
      if (globalPathA !== globalPathB) {
        throw new Error(
          `Global checksum path mismatch at share ${shareIndex}: ` +
          `Path A (sum)=${globalPathA}, Path B (polynomial)=${globalPathB}. ` +
          `This indicates a hardware fault or memory corruption during share generation.`
        );
      }
      
      share.globalChecksumVerificationShare = globalPathA;
      
      shares.push(share);
    }
    
    return shares;
  } finally {
    // Security: Clean up sensitive data from memory
    secureWipeArray(wordIndices);
    wordPolynomials.forEach(poly => secureWipeArray(poly));
    rowCheckPolynomials.forEach(poly => secureWipeArray(poly));
    secureWipeArray(globalCheckPolynomial);
  }
}


/**
 * Schiavinato Sharing - Split Function
 * 
 * This module implements the share generation (splitting) logic for
 * Schiavinato Sharing over GF(2053).
 */

import { validateMnemonic as validateBip39 } from '@scure/bip39';
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english';
import { mod, FIELD_PRIME } from '../core/field.js';
import { randomPolynomial, evaluatePolynomial } from '../core/polynomial.js';
import { computeRowChecks, computeMasterCheck } from './checksums.js';
import { sanitizeMnemonic, ensureSupportedWordCount } from '../utils/validation.js';
import { secureWipeArray } from '../utils/security.js';
import type { Share, SplitOptions } from '../types.js';

/**
 * Splits a BIP39 mnemonic into n Shamir shares with threshold k.
 * 
 * Implements the Schiavinato Sharing scheme:
 * 1. Validates the BIP39 mnemonic
 * 2. Converts words to indices (0-2047)
 * 3. Computes row and master checksums
 * 4. Creates degree-(k-1) polynomials for each secret
 * 5. Evaluates polynomials at x = 1, 2, ..., n
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
 * // shares[0] = { shareNumber: 1, wordShares: [...], checksumShares: [...], masterVerificationShare: ... }
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
  
  // Compute checksums
  const checksumSecrets = computeRowChecks(wordIndices);
  const masterSecret = computeMasterCheck(wordIndices);
  
  // Create polynomials (degree = k - 1)
  const degree = k - 1;
  
  const wordPolynomials = wordIndices.map((secret) => 
    randomPolynomial(secret, degree)
  );
  
  const checksumPolynomials = checksumSecrets.map((secret) => 
    randomPolynomial(secret, degree)
  );
  
  const masterPolynomial = randomPolynomial(masterSecret, degree);
  
  // Generate shares by evaluating polynomials at x = 1, 2, ..., n
  const shares: Share[] = [];
  
  try {
    for (let shareIndex = 1; shareIndex <= n; shareIndex++) {
      const share: Share = {
        shareNumber: shareIndex,
        wordShares: [],
        checksumShares: [],
        masterVerificationShare: 0
      };
      
      // Evaluate word polynomials
      for (const polynomial of wordPolynomials) {
        share.wordShares.push(evaluatePolynomial(polynomial, shareIndex));
      }
      
      // Evaluate checksum polynomials
      for (const polynomial of checksumPolynomials) {
        share.checksumShares.push(evaluatePolynomial(polynomial, shareIndex));
      }
      
      // Evaluate master polynomial
      share.masterVerificationShare = evaluatePolynomial(masterPolynomial, shareIndex);
      
      shares.push(share);
    }
    
    return shares;
  } finally {
    // Security: Clean up sensitive data from memory
    secureWipeArray(wordIndices);
    secureWipeArray(checksumSecrets);
    wordPolynomials.forEach(poly => secureWipeArray(poly));
    checksumPolynomials.forEach(poly => secureWipeArray(poly));
    secureWipeArray(masterPolynomial);
  }
}


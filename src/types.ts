/**
 * Schiavinato Sharing - TypeScript Type Definitions
 * 
 * This module defines all public and internal types used by the library.
 */

/**
 * Represents a single Shamir share containing word shares, checksums, and global checksum verification.
 */
export interface Share {
  /** The X coordinate for this share (must be unique and non-zero) */
  shareNumber: number;
  
  /** Array of word index shares (length = number of words in mnemonic) */
  wordShares: number[];
  
  /** Array of row checksum shares (length = number of rows = wordCount / 3) */
  checksumShares: number[];
  
  /** Global Checksum verification number share */
  globalChecksumVerificationShare: number;
}

/**
 * Input format for share data during recovery (same as Share interface).
 */
export interface ShareData {
  /** The X coordinate for this share (must be unique and non-zero) */
  shareNumber: number;
  
  /** Array of word index shares */
  wordShares: number[];
  
  /** Array of row checksum shares */
  checksumShares: number[];
  
  /** Global Checksum verification number share */
  globalChecksumVerificationShare: number;
}

/**
 * Result object returned by the recovery function.
 */
export interface RecoveryResult {
  /** The recovered mnemonic phrase (null if recovery failed) */
  mnemonic: string | null;
  
  /** Detailed error information */
  errors: {
    /** Array of row indices that failed checksum validation */
    row: number[];
    
    /** True if the global checksum failed */
    global: boolean;
    
    /** True if the BIP39 checksum validation failed */
    bip39: boolean;
    
    /** Generic error message (e.g., invalid inputs, structural errors) */
    generic: string | null;
    
    /** v0.4.0: Array of row indices where Path A and Path B checksums disagree */
    rowPathMismatch?: number[];
    
    /** v0.4.0: True if Path A and Path B global checksums disagree */
    globalPathMismatch?: boolean;
  };
  
  /** True if recovery was successful with no errors */
  success: boolean;
  
  /** Set of share numbers that had invalid checksums (if any) */
  sharesWithInvalidChecksums?: Set<number>;
}

/**
 * Options for the split operation.
 */
export interface SplitOptions {
  /** Custom BIP39 wordlist (defaults to English) */
  wordlist?: string[];
}

/**
 * Options for the recover operation.
 */
export interface RecoverOptions {
  /** Custom BIP39 wordlist (defaults to English) */
  wordlist?: string[];
  
  /** If true, strictly validate BIP39 checksum (default: true) */
  strictValidation?: boolean;
}

/**
 * Configuration options for the random source (for testing).
 */
export interface RandomSource {
  /** Function that fills a Uint32Array with random values */
  getRandomValues(array: Uint32Array): void;
}

/**
 * Point on a polynomial curve used for interpolation.
 */
export interface Point {
  /** X coordinate (share number) */
  x: number;
  
  /** Y coordinate (share value) */
  y: number;
}


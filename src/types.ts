/**
 * DuraShare - TypeScript Type Definitions
 *
 * Public and internal types used by the library (protocol v0.5.0).
 */

/**
 * A single Shamir share: word shares, row/column checksums, and printed GIC.
 */
export interface Share {
  /** The X coordinate for this share (must be unique and non-zero) */
  shareNumber: number;

  /** Word index shares (length = word count) */
  wordShares: number[];

  /** Row checksum shares (length = wordCount / 3) */
  checksumShares: number[];

  /** Column checksum shares Col1–Col3 (length 3) */
  columnChecksumShares: number[];

  /** Printed Global Integrity Check (GIC), bound with share number X */
  globalIntegrityCheckShare: number;
}

/**
 * Input format for recovery. Checksum/GIC slots may be blank (non-integer).
 * Optional shareIndex is a 1-based UI slot for error highlighting.
 */
export interface ShareData {
  shareNumber: number;
  wordShares: number[];
  checksumShares: Array<number | undefined>;
  columnChecksumShares: Array<number | undefined>;
  globalIntegrityCheckShare?: number;
  shareIndex?: number;
}

/**
 * Result of recoverAndValidate (aligned with HTML tool report shape).
 */
export interface RecoveryResult {
  /** Recovered mnemonic phrase (null if indices out of BIP39 range) */
  recoveredMnemonic: string | null;

  /** Copy of recovered 1-based BIP39 indices (or null) */
  recoveredIndices: number[] | null;

  /** Detailed error information */
  errors: {
    row: number[];
    global: boolean;
    bip39: boolean;
    generic: string | null;
    shareValidation: {
      rowErrors: { shareIndex: number; rowIndex: number }[];
      columnErrors: { shareIndex: number; columnIndex: number }[];
      globalErrors: { shareIndex: number }[];
      message: string;
    } | null;
    rowPathMismatch: number[];
    globalPathMismatch: boolean;
    column: number[];
    failedRows: {
      rowNumber: number;
      wordPositions: number[];
      checksumLabel: string;
    }[];
    globalIntegrityCheckError: {
      failed: boolean;
      isNightmare: boolean;
    };
  };

  /** True when recovery succeeded with no DuraShare or BIP39 errors */
  success: boolean;
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
 * Result of splitBip39 (aligned with HTML tool).
 */
export interface SplitResult {
  shares: Share[];
}

/**
 * Configuration options for the random source (for testing).
 */
export interface RandomSource {
  /** Function that fills a Uint32Array with random values */
  getRandomValues(array: Uint32Array): void;
}

/**
 * Environment overrides for testing / non-browser hosts.
 */
export interface EnvironmentOptions {
  randomSource?: RandomSource;
  /** SHA-256 helper with arrayBuffer(message) — reserved for HTML parity */
  sha256?: ((message: Uint8Array | string) => unknown) & {
    arrayBuffer(message: Uint8Array | string): ArrayBuffer | Promise<ArrayBuffer>;
  };
}

/**
 * A point (x, y) on a polynomial for Lagrange interpolation.
 */
export interface Point {
  x: number;
  y: number;
}

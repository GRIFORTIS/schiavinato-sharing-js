/**
 * Tests for BIP39 seed generation utilities
 */

import { describe, it, expect } from 'vitest';
import { validateBip39Mnemonic } from '../src/bip39/validation';
import {
  generateValidMnemonic,
  mnemonicToIndices,
  indicesToMnemonic,
  parseInput
} from '../src/utils/seedGenerator';

describe('Seed Generation Utilities', () => {
  describe('generateValidMnemonic', () => {
    it('should generate a valid 12-word mnemonic', () => {
      const mnemonic = generateValidMnemonic(12);
      const words = mnemonic.split(' ');
      
      expect(words).toHaveLength(12);
      expect(validateBip39Mnemonic(mnemonic)).toBe(true);
    });

    it('should generate a valid 24-word mnemonic', () => {
      const mnemonic = generateValidMnemonic(24);
      const words = mnemonic.split(' ');
      
      expect(words).toHaveLength(24);
      expect(validateBip39Mnemonic(mnemonic)).toBe(true);
    });

    it('should generate different mnemonics on successive calls', () => {
      const mnemonic1 = generateValidMnemonic(12);
      const mnemonic2 = generateValidMnemonic(12);
      
      expect(mnemonic1).not.toBe(mnemonic2);
    });

    it('should throw error for invalid word count', () => {
      expect(() => generateValidMnemonic(15 as any)).toThrow('Word count must be 12 or 24');
      expect(() => generateValidMnemonic(18 as any)).toThrow('Word count must be 12 or 24');
    });
  });

  describe('mnemonicToIndices', () => {
    it('should convert words to indices correctly (1-based)', () => {
      const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      const indices = mnemonicToIndices(mnemonic);
      
      expect(indices).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4]);
    });

    it('should handle test vector mnemonic', () => {
      const mnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';
      const indices = mnemonicToIndices(mnemonic);
      
      expect(indices).toEqual([1680, 1471, 217, 42, 1338, 279, 1907, 324, 468, 682, 1844, 126]);
    });

    it('should handle mixed case and extra whitespace', () => {
      const mnemonic = '  ABANDON  abandon   ABANDON  ';
      const indices = mnemonicToIndices(mnemonic);
      
      expect(indices).toEqual([1, 1, 1]);
    });

    it('should throw error for invalid word', () => {
      expect(() => mnemonicToIndices('abandon invalid word')).toThrow('not in the BIP39 wordlist');
    });
  });

  describe('indicesToMnemonic', () => {
    it('should convert indices to words correctly (1-based)', () => {
      const indices = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4];
      const mnemonic = indicesToMnemonic(indices);
      
      expect(mnemonic).toBe('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    });

    it('should handle test vector indices', () => {
      const indices = [1680, 1471, 217, 42, 1338, 279, 1907, 324, 468, 682, 1844, 126];
      const mnemonic = indicesToMnemonic(indices);
      
      expect(mnemonic).toBe('spin result brand ahead poet carpet unusual chronic denial festival toy autumn');
    });

    it('should throw error for out of range index', () => {
      expect(() => indicesToMnemonic([1, 2049, 1])).toThrow('out of range');
      expect(() => indicesToMnemonic([1, 0, 1])).toThrow('out of range');
      expect(() => indicesToMnemonic([1, -1, 1])).toThrow('out of range');
    });
  });

  describe('parseInput', () => {
    it('should parse space-separated words', () => {
      const result = parseInput('abandon abandon abandon');
      
      expect(result.words).toEqual(['abandon', 'abandon', 'abandon']);
      expect(result.indices).toEqual([1, 1, 1]);
      expect(result.type).toBe('words');
    });

    it('should parse comma-separated words', () => {
      const result = parseInput('abandon, abandon, abandon');
      
      expect(result.words).toEqual(['abandon', 'abandon', 'abandon']);
      expect(result.indices).toEqual([1, 1, 1]);
      expect(result.type).toBe('words');
    });

    it('should parse newline-separated words', () => {
      const result = parseInput('abandon\nabandon\nabandon');
      
      expect(result.words).toEqual(['abandon', 'abandon', 'abandon']);
      expect(result.indices).toEqual([1, 1, 1]);
      expect(result.type).toBe('words');
    });

    it('should parse space-separated indices (1-based)', () => {
      const result = parseInput('1 1 4');
      
      expect(result.indices).toEqual([1, 1, 4]);
      expect(result.words).toEqual(['abandon', 'abandon', 'about']);
      expect(result.type).toBe('indices');
    });

    it('should parse mixed separators', () => {
      const result = parseInput('abandon, abandon\n1');
      
      expect(result.words).toEqual(['abandon', 'abandon', 'abandon']);
      expect(result.indices).toEqual([1, 1, 1]);
      expect(result.type).toBe('mixed');
    });

    it('should handle share values (0, 2049-2052)', () => {
      const result = parseInput('1 2050 101');
      
      expect(result.indices).toEqual([1, 2050, 101]);
      expect(result.words[0]).toBe('abandon');
      expect(result.words[1]).toBe('[2050]'); // Share value placeholder
      expect(result.words[2]).toBe('arrive'); // Index 101 = 'arrive' (1-based)
    });

    it('should throw error for out of range index', () => {
      expect(() => parseInput('1 2053 1')).toThrow('out of range');
      expect(() => parseInput('1 3000 1')).toThrow('out of range');
    });

    it('should throw error for invalid word', () => {
      expect(() => parseInput('abandon invalidword abandon')).toThrow('not in the BIP39 wordlist');
    });
  });

  describe('round-trip conversions', () => {
    it('should successfully round-trip mnemonic -> indices -> mnemonic', () => {
      const originalMnemonic = 'spin result brand ahead poet carpet unusual chronic denial festival toy autumn';
      const indices = mnemonicToIndices(originalMnemonic);
      const reconstructedMnemonic = indicesToMnemonic(indices);
      
      expect(reconstructedMnemonic).toBe(originalMnemonic);
    });

    it('should successfully round-trip with generated valid mnemonic', () => {
      const originalMnemonic = generateValidMnemonic(12);
      const indices = mnemonicToIndices(originalMnemonic);
      const reconstructedMnemonic = indicesToMnemonic(indices);
      
      expect(reconstructedMnemonic).toBe(originalMnemonic);
    });
  });
});


/**
 * Platform Fallback Tests
 * 
 * Verifies that the random number generator correctly falls back to
 * Node.js 'crypto' module when Web Crypto API is unavailable.
 * 
 * This ensures the library works in older Node.js environments or
 * restricted contexts where globalThis.crypto is missing.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Platform Fallback (Node.js Legacy)', () => {
  const originalCrypto = globalThis.crypto;

  beforeEach(() => {
    // Reset module registry to force re-evaluation of random.ts
    vi.resetModules();
  });

  afterEach(() => {
    // Restore global crypto
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true
    });
  });

  it('should use Node.js crypto fallback when Web Crypto is missing', async () => {
    // 1. Simulate environment without Web Crypto
    // We use Object.defineProperty because strictly deleting globals can be restricted
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      writable: true,
      configurable: true
    });

    // 2. Import the module (this triggers the top-level detection logic)
    const randomModule = await import('../src/utils/random.js');

    // 3. Verify it still works (using the fallback)
    const randomVal = randomModule.getRandomIntInclusive(100);
    expect(randomVal).toBeGreaterThanOrEqual(0);
    expect(randomVal).toBeLessThanOrEqual(100);

    // 4. Verify it's using the fallback source
    // We can't easily inspect the internal 'randomSource' variable,
    // but the fact that it works without throwing "Secure randomness provider is not configured"
    // proves the fallback logic executed successfully.
  });

  it.skipIf(!globalThis.crypto)('should initialize successfully with Web Crypto (standard path)', async () => {
    // 1. Ensure Web Crypto is present (standard Node 20+ env)
    // Note: Skipped on Node 18.x where globalThis.crypto may be undefined
    expect(globalThis.crypto).toBeDefined();

    // 2. Import module
    const randomModule = await import('../src/utils/random.js');

    // 3. Verify it works
    const randomVal = randomModule.getRandomIntInclusive(100);
    expect(randomVal).toBeGreaterThanOrEqual(0);
    expect(randomVal).toBeLessThanOrEqual(100);
  });
});

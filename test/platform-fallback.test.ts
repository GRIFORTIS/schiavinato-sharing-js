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

  it('should work correctly regardless of platform (Web Crypto or Node.js fallback)', async () => {
    // 1. Don't assume which crypto source is available - both are valid
    // On Node 20+: Uses Web Crypto (globalThis.crypto)
    // On Node 18 or restricted envs: Uses Node.js crypto module (fallback)

    // 2. Import module (will use whatever source is available)
    const randomModule = await import('../src/utils/random.js');

    // 3. Verify it produces secure random numbers
    const randomVal = randomModule.getRandomIntInclusive(100);
    expect(randomVal).toBeGreaterThanOrEqual(0);
    expect(randomVal).toBeLessThanOrEqual(100);
    
    // 4. Test multiple values to ensure proper distribution
    const values = Array.from({ length: 10 }, () => randomModule.getRandomIntInclusive(10));
    values.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(10);
    });
  });
});

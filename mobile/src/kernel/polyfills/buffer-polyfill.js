/**
 * Buffer polyfill for React Native
 *
 * This polyfill is injected by Metro's getPolyfills() and runs in the global scope
 * BEFORE any modules load, ensuring Buffer is available globally so that libraries
 * like int64-buffer can detect it via typeof Buffer check.
 *
 * The issue: int64-buffer checks `typeof Buffer` at module load time. If Buffer
 * is not available, it skips adding the `toBuffer()` method, causing runtime errors
 * when ledgerjs-hw-app-cardano tries to call `.toBuffer()`.
 *
 * Solution: Set Buffer on global/globalThis BEFORE int64-buffer loads, so that
 * `typeof Buffer` returns "function" instead of "undefined".
 *
 * IMPORTANT: This file must NOT use an IIFE or strict mode that prevents
 * Buffer from being accessible in the global scope for typeof checks.
 *
 * Reference: https://github.com/craftzdog/react-native-buffer/issues
 *
 * @fileoverview Metro polyfill - must use CommonJS require() syntax
 */

/* global globalThis */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */

// Import Buffer from react-native-buffer polyfill
// Metro will resolve this module correctly in the polyfill context via resolver
// Note: Polyfills run in CommonJS context, so require() is correct here
// Wrap in try-catch to prevent initialization errors if native modules aren't ready yet
try {
  var BufferPolyfill = require('@craftzdog/react-native-buffer').Buffer

  // Set Buffer on global and globalThis
  // This makes Buffer available for typeof Buffer checks in subsequent modules
  // When int64-buffer checks typeof Buffer, it will find it on the global object
  if (typeof global !== 'undefined') {
    global.Buffer = BufferPolyfill
  }
  // globalThis is available in modern JavaScript environments (ES2020+)
  if (typeof globalThis !== 'undefined') {
    globalThis.Buffer = BufferPolyfill
  }

  // Also set on window for web compatibility (if running in web context)
  if (typeof window !== 'undefined') {
    window.Buffer = BufferPolyfill
  }
} catch (e) {
  // If Buffer polyfill fails to load (e.g., native modules not ready),
  // shims.ts will handle it as a fallback when modules load
  // This prevents breaking React Native initialization
  // The int64-buffer patch will also provide fallback checks
}

/* eslint-disable no-restricted-syntax */
/**
 * Exception: Error classes must extend Error class for proper error handling and instanceof checks.
 * This is a fundamental JavaScript/TypeScript requirement for error handling.
 */
export const invalid = (message: string) => {
  throw new Error(message)
}

export class ApiError extends Error {}

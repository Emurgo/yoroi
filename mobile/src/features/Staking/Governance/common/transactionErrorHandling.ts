/**
 * Utility functions for handling transaction building errors
 */

/**
 * Checks if an error is due to insufficient balance/ADA
 * Detects various error messages from transaction building that indicate insufficient funds
 */
export const isInsufficientBalanceError = (error: unknown): boolean => {
  const errorMessage = error instanceof Error ? error.message : String(error)

  return (
    errorMessage.includes('Insufficient input in transaction') ||
    errorMessage.includes('Not enough ADA leftover') ||
    errorMessage.includes('add_change_if_needed') ||
    errorMessage.includes('shortage:') ||
    errorMessage.includes('Not enough ADA') ||
    errorMessage.includes('Insufficient input')
  )
}

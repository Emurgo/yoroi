/**
 * Base error class for UTXO service errors
 * Error classes are required to extend Error for proper error handling
 */
// eslint-disable-next-line no-restricted-syntax
export class UtxoServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly suggestions: string[] = [],
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'UtxoServiceError'
  }
}

/**
 * Error when there's insufficient ADA to complete a transfer
 * Error classes are required to extend Error for proper error handling
 */
// eslint-disable-next-line no-restricted-syntax
export class InsufficientAdaError extends UtxoServiceError {
  constructor(
    public readonly requiredAda: bigint,
    public readonly availableAda: bigint,
    suggestions: string[] = [],
    details?: Record<string, unknown>,
  ) {
    super(
      'INSUFFICIENT_ADA',
      `Insufficient ADA: Need ${requiredAda.toString()} but only ${availableAda.toString()} available`,
      suggestions,
      {
        requiredAda: requiredAda.toString(),
        availableAda: availableAda.toString(),
        ...details,
      },
    )
    this.name = 'InsufficientAdaError'
  }
}

/**
 * Error when there are insufficient tokens to complete a transfer
 * Error classes are required to extend Error for proper error handling
 */
// eslint-disable-next-line no-restricted-syntax
export class InsufficientTokensError extends UtxoServiceError {
  constructor(
    public readonly tokenId: string,
    public readonly required: bigint,
    public readonly available: bigint,
    suggestions: string[] = [],
    details?: Record<string, unknown>,
  ) {
    super(
      'INSUFFICIENT_TOKENS',
      `Insufficient tokens: Need ${required.toString()} but only ${available.toString()} available for token ${tokenId}`,
      suggestions,
      {
        tokenId,
        required: required.toString(),
        available: available.toString(),
        ...details,
      },
    )
    this.name = 'InsufficientTokensError'
  }
}

/**
 * Error when UTXO selection fails
 * Error classes are required to extend Error for proper error handling
 */
// eslint-disable-next-line no-restricted-syntax
export class UtxoSelectionFailedError extends UtxoServiceError {
  constructor(
    message: string,
    suggestions: string[] = [],
    details?: Record<string, unknown>,
  ) {
    super('UTXO_SELECTION_FAILED', message, suggestions, details)
    this.name = 'UtxoSelectionFailedError'
  }
}

/**
 * Error when change output would violate minimum UTXO requirements
 * Error classes are required to extend Error for proper error handling
 */
// eslint-disable-next-line no-restricted-syntax
export class ChangeOutputError extends UtxoServiceError {
  constructor(
    public readonly requiredMinAda: bigint,
    public readonly availableAda: bigint,
    suggestions: string[] = [],
    details?: Record<string, unknown>,
  ) {
    super(
      'CHANGE_OUTPUT_ERROR',
      `Change output requires ${requiredMinAda.toString()} ADA minimum, but only ${availableAda.toString()} available`,
      suggestions,
      {
        requiredMinAda: requiredMinAda.toString(),
        availableAda: availableAda.toString(),
        ...details,
      },
    )
    this.name = 'ChangeOutputError'
  }
}

/**
 * Error when fee estimation fails
 * Error classes are required to extend Error for proper error handling
 */
// eslint-disable-next-line no-restricted-syntax
export class FeeEstimationError extends UtxoServiceError {
  constructor(
    message: string,
    suggestions: string[] = [],
    details?: Record<string, unknown>,
  ) {
    super('FEE_ESTIMATION_ERROR', message, suggestions, details)
    this.name = 'FeeEstimationError'
  }
}

/**
 * Helper function to format lovelace to ADA for display
 * 1 ADA = 1,000,000 lovelace
 */
function formatLovelaceToAda(lovelace: bigint | string): string {
  const lovelaceBigInt =
    typeof lovelace === 'string' ? BigInt(lovelace) : lovelace
  const ada = Number(lovelaceBigInt) / 1_000_000
  // Format with up to 6 decimal places, removing trailing zeros
  return ada.toFixed(6).replace(/\.?0+$/, '')
}

/**
 * Helper function to create user-friendly error messages with suggestions
 */
export function createErrorSuggestions(
  errorType: string,
  context: Record<string, unknown>,
): string[] {
  const suggestions: string[] = []

  switch (errorType) {
    case 'INSUFFICIENT_ADA': {
      const requiredAda = context.requiredAda as bigint | string | undefined
      const availableAda = context.availableAda as bigint | string | undefined
      const unlockedByConsolidation = context.unlockedByConsolidation as
        | bigint
        | string
        | undefined

      if (unlockedByConsolidation) {
        const unlockedBigInt =
          typeof unlockedByConsolidation === 'string'
            ? BigInt(unlockedByConsolidation)
            : unlockedByConsolidation
        if (unlockedBigInt > BigInt(0)) {
          suggestions.push(
            `Consider consolidating CNT tokens to unlock ${formatLovelaceToAda(unlockedBigInt)} ADA`,
          )
        }
      }

      if (requiredAda && availableAda) {
        const requiredBigInt =
          typeof requiredAda === 'string' ? BigInt(requiredAda) : requiredAda
        const availableBigInt =
          typeof availableAda === 'string' ? BigInt(availableAda) : availableAda
        const shortfall = requiredBigInt - availableBigInt
        suggestions.push(
          `Reduce transfer amount by ${formatLovelaceToAda(shortfall)} ADA to proceed`,
        )
      }

      suggestions.push('Check if you have any pending transactions')
      break
    }

    case 'INSUFFICIENT_TOKENS':
      suggestions.push('Verify you have enough tokens in your wallet')
      suggestions.push('Check if tokens are locked in pending transactions')
      break

    case 'UTXO_SELECTION_FAILED':
      suggestions.push('Try consolidating your UTXOs')
      suggestions.push('Reduce the number of tokens being sent')
      break

    case 'CHANGE_OUTPUT_ERROR':
      suggestions.push('Reduce the amount being sent')
      suggestions.push('Consolidate UTXOs to reduce change output complexity')
      break

    case 'FEE_ESTIMATION_ERROR':
      suggestions.push('Try again with a simpler transaction')
      suggestions.push('Reduce the number of outputs')
      break
  }

  return suggestions
}

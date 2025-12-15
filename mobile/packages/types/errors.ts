/* eslint-disable no-restricted-syntax */
/**
 * Centralized Error Classes
 *
 * All error classes are consolidated here for better organization and maintainability.
 * Errors are organized by category: App, API, Wallet, Transaction, Hardware, etc.
 *
 * Exception: Error classes must extend Error class for proper error handling and instanceof checks.
 * This is a fundamental JavaScript/TypeScript requirement for error handling.
 */
import {MessageDescriptor} from 'react-intl'

import type {TransactionValidationResult} from './tx/validation'

// ============================================================================
// Base Error Classes
// ============================================================================

/**
 * Base error class for transaction-related errors with unique IDs
 */
export abstract class BaseError extends Error {
  private _id: string

  get id(): string {
    return this._id
  }

  constructor(id: string, message: string) {
    super(message)
    this._id = id
  }
}

/**
 * Base error class for localizable errors (errors that can be translated)
 */
export class LocalizableError extends Error {
  constructor(readonly descriptor: MessageDescriptor) {
    super()
  }
}

// ============================================================================
// App Errors
// ============================================================================

export class AppErrorInvalidState extends Error {}
export class AppErrorWrongPassword extends Error {}
export class AppErrorLibraryFailed extends Error {}

// ============================================================================
// API Errors
// ============================================================================

/**
 * Generic API error
 */
export class ApiError extends LocalizableError {
  public values: {response: string | null} = {response: null}

  constructor(response: string | null) {
    super({
      id: 'api.error.unknown',
      defaultMessage: 'API error: {response}',
    })
    this.values = {response}
  }
}

export class ApiErrorBadRequest extends Error {}
export class ApiErrorUnauthorized extends Error {}
export class ApiErrorForbidden extends Error {}
export class ApiErrorNotFound extends Error {}
export class ApiErrorConflict extends Error {}
export class ApiErrorGone extends Error {}
export class ApiErrorTooEarly extends Error {}
export class ApiErrorTooManyRequests extends Error {}
export class ApiErrorServerSide extends Error {}
export class ApiErrorUnknown extends Error {}
export class ApiErrorNetwork extends Error {}
export class ApiErrorInvalidState extends Error {}
export class ApiErrorResponseMalformed extends Error {}
export class ApiErrorServiceUnavailable extends Error {}
export class ApiErrorMethodNotAllowed extends Error {}
export class ApiErrorContentNotAcceptable extends Error {}

/**
 * Error thrown by the backend after a rollback
 * Contains specific error codes for transaction history issues
 */
export class ApiHistoryError extends ApiError {
  public static readonly errors = {
    REFERENCE_TX_NOT_FOUND: 'REFERENCE_TX_NOT_FOUND',
    REFERENCE_BLOCK_MISMATCH: 'REFERENCE_BLOCK_MISMATCH',
    REFERENCE_BEST_BLOCK_MISMATCH: 'REFERENCE_BEST_BLOCK_MISMATCH',
  } as const

  constructor(response: string | null) {
    super(response)
  }
}

// ============================================================================
// Transaction Errors
// ============================================================================

export class NotEnoughMoneyToSendError extends BaseError {
  constructor() {
    super(
      'ceae0da9-9653-4b46-b658-00701f73573a',
      'Not enough balance for transaction',
    )
  }
}

export class AssetOverflowError extends BaseError {
  constructor() {
    super('6edf10e8-472a-4d7e-9871-3184175cf980', 'Asset overflow')
  }
}

export class NoOutputsError extends BaseError {
  constructor() {
    super('23f2aa70-7e40-4cae-a113-3f8919ad45ec', 'No outputs')
  }
}

export class GenericError extends BaseError {
  constructor() {
    super('c07c9d6f-ba71-44b2-af26-72704a154bf6', '')
  }
}

export class RewardAddressEmptyError extends BaseError {
  constructor() {
    super('6ad14231-59f5-405d-8fc1-69a0acb92195', 'Reward address empty')
  }
}

export class SubmitTxInsufficientCollateralError extends Error {}

/**
 * Enhanced error for CIP-30 transaction signing
 */
export class CIP30TransactionError extends Error {
  constructor(
    message: string,
    public readonly validation: TransactionValidationResult,
  ) {
    super(message)
    this.name = 'CIP30TransactionError'
  }
}

// ============================================================================
// Wallet & Address Errors
// ============================================================================

export class AddressErrorWrongNetwork extends Error {}
export class AddressErrorInvalid extends Error {}

// ============================================================================
// Hardware Wallet Errors
// ============================================================================

export class BaseLedgerError extends LocalizableError {
  public values: Record<string, unknown>

  constructor(
    descriptor: MessageDescriptor,
    values: Record<string, unknown> = {},
  ) {
    super(descriptor)
    this.values = values
  }
}

export class BluetoothDisabledError extends BaseLedgerError {
  constructor() {
    super({
      id: 'ledger.bluetoothDisabledError',
      defaultMessage:
        'Bluetooth is disabled. Please enable Bluetooth to connect to your Ledger device.',
    })
  }
}

export class GeneralConnectionError extends BaseLedgerError {
  constructor() {
    super({
      id: 'ledger.connectionError',
      defaultMessage:
        'Failed to connect to Ledger device. Please check your connection and try again.',
    })
  }
}

export class LedgerUserError extends BaseLedgerError {
  constructor() {
    super({
      id: 'ledger.connectionError',
      defaultMessage:
        'Failed to connect to Ledger device. Please check your connection and try again.',
    })
  }
}

export class RejectedByUserError extends BaseLedgerError {
  constructor() {
    super({
      id: 'ledger.rejectedByUserError',
      defaultMessage:
        'Operation was rejected by the user on the Ledger device.',
    })
  }
}

export class AdaAppClosedError extends BaseLedgerError {
  constructor() {
    super({
      id: 'ledger.appOpened',
      defaultMessage: 'Please open the Cardano app on your Ledger device.',
    })
  }
}

export class DeprecatedAdaAppError extends BaseLedgerError {
  constructor(version?: string) {
    super(
      {
        id: 'ledger.deprecatedAdaAppError',
        defaultMessage:
          'Please update your Ledger Cardano app to version {version} or higher',
      },
      {version: version ?? '2.2.1'},
    )
  }
}

// ============================================================================
// Storage & Migration Errors
// ============================================================================

export class ErrorMigrationVersion extends Error {}

export class CancelledByUser extends Error {}
export class TooManyAttempts extends Error {}

// ============================================================================
// Scan Errors
// ============================================================================

export class ScanErrorUnknownContent extends Error {}
export class ScanErrorUnknown extends Error {}

// ============================================================================
// Resolver Errors
// ============================================================================

export class ResolverErrorInvalidResponse extends Error {}
export class ResolverErrorInvalidDomain extends Error {}
export class ResolverErrorNotFound extends Error {}
export class ResolverErrorUnsupportedTld extends Error {}
export class ResolverErrorExpiredDomain extends Error {}
export class ResolverErrorWrongBlockchain extends Error {}

// ============================================================================
// Link Errors
// ============================================================================

export class LinksErrorForbiddenParamsProvided extends Error {
  constructor(message?: string) {
    super(message)
  }
}
export class LinksErrorExtraParamsDenied extends Error {
  constructor(message?: string) {
    super(message)
  }
}
export class LinksErrorRequiredParamsMissing extends Error {
  constructor(message?: string) {
    super(message)
  }
}
export class LinksErrorParamsValidationFailed extends Error {
  constructor(message?: string) {
    super(message)
  }
}
export class LinksErrorUnsupportedAuthority extends Error {
  constructor(message?: string) {
    super(message)
  }
}
export class LinksErrorUnsupportedVersion extends Error {
  constructor(message?: string) {
    super(message)
  }
}
export class LinksErrorSchemeNotImplemented extends Error {
  constructor(message?: string) {
    super(message)
  }
}

// ============================================================================
// Exchange Errors
// ============================================================================

export class ExchangeValidationError extends Error {
  constructor(message?: string) {
    super(message)
  }
}
export class ExchangeUnknownError extends Error {
  constructor(message?: string) {
    super(message)
  }
}
export class ExchangeProviderNotFoundError extends Error {
  constructor(message?: string) {
    super(message)
  }
}

// ============================================================================
// Claim API Errors
// ============================================================================

export class ClaimApiErrorsInvalidRequest extends Error {
  static readonly statusCode = 400
}

export class ClaimApiErrorsNotFound extends Error {
  static readonly statusCode = 404
}

export class ClaimApiErrorsAlreadyClaimed extends Error {
  static readonly statusCode = 409
}

export class ClaimApiErrorsExpired extends Error {
  static readonly statusCode = 410
}

export class ClaimApiErrorsTooEarly extends Error {
  static readonly statusCode = 425
}

export class ClaimApiErrorsRateLimited extends Error {
  static readonly statusCode = 429
}

// ============================================================================
// Number Errors
// ============================================================================

export class NumbersErrorInvalidAtomicValue extends Error {}

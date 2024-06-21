import {errorMessages} from '../../kernel/i18n/global-messages'
import LocalizableError from '../../kernel/i18n/LocalizableError'

// thrown when the request did go through but
// backend returned an unexpected result
export class ApiError extends LocalizableError {
  constructor(response: string | null) {
    super({
      id: errorMessages.apiError.message.id,
      defaultMessage: errorMessages.apiError.message.defaultMessage || '',
      values: {
        response,
      },
    })
  }
}

// thrown by the backend after a rollback
export class ApiHistoryError extends ApiError {
  public static readonly errors = {
    REFERENCE_TX_NOT_FOUND: 'REFERENCE_TX_NOT_FOUND',
    REFERENCE_BLOCK_MISMATCH: 'REFERENCE_BLOCK_MISMATCH',
    REFERENCE_BEST_BLOCK_MISMATCH: 'REFERENCE_BEST_BLOCK_MISMATCH',
  }
}

// @flow

import LocalizableError from '../i18n/LocalizableError'
import {errorMessages} from '../i18n/global-messages'

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

// thrown when api failed to connect to the server
export class NetworkError extends LocalizableError {
  constructor() {
    super({
      id: errorMessages.networkError.message.id,
      defaultMessage: errorMessages.networkError.message.defaultMessage || '',
    })
  }
}

// thrown by the backend after a rollback
export class ApiHistoryError extends ApiError {}

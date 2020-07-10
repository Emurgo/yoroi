// @flow
import ExtendableError from 'es6-error'

// thrown when the request did go through but
// backend returned an unexpected result
export class ApiError extends ExtendableError {
  constructor(request: any) {
    super('ApiError')
    this.request = request
  }
}

// thrown when api failed to connect to the server
export class NetworkError extends ExtendableError {
  constructor() {
    super('NetworkError')
  }
}

// thrown by the backend after a rollback
export class ApiHistoryError extends ApiError {
  constructor(status: string) {
    super(`ApiHistoryError::${status}`)
  }
}

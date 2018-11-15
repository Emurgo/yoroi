import ExtendableError from 'es6-error'

// thrown when the request did go through but
// backend returned an unexpected result
export class ApiError extends ExtendableError {
  constructor(request) {
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

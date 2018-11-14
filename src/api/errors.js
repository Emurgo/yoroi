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
export class ConnectionError extends ExtendableError {
  constructor() {
    super('ConnectionError')
  }
}

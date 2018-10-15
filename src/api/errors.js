import ExtendableError from 'es6-error'

export class ApiError extends ExtendableError {
  constructor(request) {
    super('ApiError')
    this.request = request
  }
}
export class NotConnectedError extends ExtendableError {
  constructor() {
    super('NotConnectedError')
  }
}


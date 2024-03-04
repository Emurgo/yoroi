export const BanxaErrorMessages = {
  ValidationError: 'ValidationError',
  UnknownError: 'Unknown error'
};
export class BanxaValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}
export class BanxaUnknownError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnknownError';
  }
}
//# sourceMappingURL=errors.js.map
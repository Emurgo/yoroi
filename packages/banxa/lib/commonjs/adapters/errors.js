"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BanxaValidationError = exports.BanxaUnknownError = exports.BanxaErrorMessages = void 0;
const BanxaErrorMessages = {
  ValidationError: 'ValidationError',
  UnknownError: 'Unknown error'
};
exports.BanxaErrorMessages = BanxaErrorMessages;
class BanxaValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}
exports.BanxaValidationError = BanxaValidationError;
class BanxaUnknownError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnknownError';
  }
}
exports.BanxaUnknownError = BanxaUnknownError;
//# sourceMappingURL=errors.js.map
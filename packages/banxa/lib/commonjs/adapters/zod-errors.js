"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleZodErrors = handleZodErrors;
var _errors = require("./errors");
var _zod = require("zod");
/**
 * Converts a ZodError or Error to a BanxaError.
 * @param error - The error to convert.
 * @throws An appropriate BanxaError based on zod error, or ignore it.
 */
function handleZodErrors(error) {
  if (error instanceof _zod.ZodError) {
    const errorDetails = error.issues.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    const errorMessage = `Invalid data: ${errorDetails.map(e => `${e.field}: ${e.message}`).join(', ')}`;
    throw new _errors.BanxaValidationError(errorMessage);
  }
  throw new _errors.BanxaUnknownError(JSON.stringify(error));
}
//# sourceMappingURL=zod-errors.js.map
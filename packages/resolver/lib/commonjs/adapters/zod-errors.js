"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleZodErrors = handleZodErrors;
var _zod = require("zod");
function handleZodErrors(error) {
  if (error instanceof _zod.ZodError) {
    const errorDetails = error.issues.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    const errorMessage = `Invalid data: ${errorDetails.map(e => `${e.field}: ${e.message}`).join(', ')}`;
    return errorMessage;
  }
  return null;
}
//# sourceMappingURL=zod-errors.js.map
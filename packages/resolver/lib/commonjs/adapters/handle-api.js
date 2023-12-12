"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHandleCryptoAddress = exports.HandleValidationError = exports.HandleUnknownError = void 0;
var _src = require("@yoroi/common/src");
var _zod = require("zod");
var _zodErrors = require("./zod-errors");
const getHandleCryptoAddress = async receiverDomain => {
  try {
    const validatedHandle = stringWithDollarSchema.parse(receiverDomain);
    const handle = validatedHandle.replace(/^\$/, '');
    const config = {
      method: 'get',
      url: `https://api.handle.me/handles/${handle}`,
      headers: {
        Accept: 'application/json'
      }
    };
    const response = await (0, _src.fetcher)(config);
    const validatedHandleResponse = HandleResponseSchema.parse(response);
    const address = validatedHandleResponse.resolved_addresses.ada;
    return address;
  } catch (error) {
    const zodErrorMessage = (0, _zodErrors.handleZodErrors)(error);
    if (zodErrorMessage) throw new HandleValidationError(zodErrorMessage);
    throw new HandleUnknownError(JSON.stringify(error));
  }
};
exports.getHandleCryptoAddress = getHandleCryptoAddress;
const HandleResponseSchema = _zod.z.object({
  resolved_addresses: _zod.z.object({
    ada: _zod.z.string()
  })
});
const stringWithDollarSchema = _zod.z.string().refine(value => {
  return value.startsWith('$');
}, {
  message: "The domain must start with a '$' symbol"
});
class HandleValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'HandleValidationError';
  }
}
exports.HandleValidationError = HandleValidationError;
class HandleUnknownError extends Error {
  constructor(message) {
    super(message);
    this.name = 'HandleUnknownError';
  }
}
exports.HandleUnknownError = HandleUnknownError;
//# sourceMappingURL=handle-api.js.map
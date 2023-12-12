"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUnstoppableCryptoAddress = exports.UnstoppableValidationError = exports.UnstoppableUnknownError = void 0;
var _resolution = require("@unstoppabledomains/resolution");
var _zod = require("zod");
var _zodErrors = require("./zod-errors");
const getUnstoppableCryptoAddress = async (receiverDomain, apiKey) => {
  try {
    const resolution = new _resolution.Resolution({
      sourceConfig: {
        uns: {
          locations: {
            Layer1: {
              url: `https://mainnet.infura.io/v3/${apiKey}`,
              network: 'mainnet'
            },
            Layer2: {
              url: `https://polygon-mainnet.infura.io/v3/${apiKey}`,
              network: 'polygon-mainnet'
            }
          }
        },
        zns: {
          url: 'https://api.zilliqa.com',
          network: 'mainnet'
        }
      }
    });
    const response = await resolution.addr(receiverDomain, 'ADA');
    const validatedHandleResponse = StoppableResponseSchema.parse(response);
    return validatedHandleResponse;
  } catch (error) {
    const zodErrorMessage = (0, _zodErrors.handleZodErrors)(error);
    if (zodErrorMessage) throw new UnstoppableValidationError(zodErrorMessage);
    throw new UnstoppableUnknownError(JSON.stringify(error));
  }
};
exports.getUnstoppableCryptoAddress = getUnstoppableCryptoAddress;
const StoppableResponseSchema = _zod.z.string();
class UnstoppableValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnstoppableValidationError';
  }
}
exports.UnstoppableValidationError = UnstoppableValidationError;
class UnstoppableUnknownError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnstoppableUnknownError';
  }
}
exports.UnstoppableUnknownError = UnstoppableUnknownError;
//# sourceMappingURL=unstoppable-api.js.map
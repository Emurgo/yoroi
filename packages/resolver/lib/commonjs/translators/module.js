"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolverModuleMaker = void 0;
var _api = require("../adapters/api");
const resolverModuleMaker = (resolutionStrategy, resolverStorage, apiConfig) => {
  const {
    notice
  } = resolverStorage;
  const api = (0, _api.resolverApiMaker)(resolutionStrategy, apiConfig);
  return {
    address: {
      getCryptoAddress: api.getCryptoAddress
    },
    notice
  };
};
exports.resolverModuleMaker = resolverModuleMaker;
//# sourceMappingURL=module.js.map
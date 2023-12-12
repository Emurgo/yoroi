"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolverApiMaker = exports.DomainService = void 0;
var _handleApi = require("./handle-api");
var _unstoppableApi = require("./unstoppable-api");
var _cns = require("./cns");
let DomainService = /*#__PURE__*/function (DomainService) {
  DomainService["Cns"] = "cns";
  DomainService["Unstoppable"] = "unstoppable";
  DomainService["Handle"] = "handle";
  return DomainService;
}({});
exports.DomainService = DomainService;
const resolverApiMaker = (resolutionStrategy, apiConfig) => {
  const getCryptoAddress = async receiverDomain => {
    var _apiConfig$apiKeys;
    const operations = {
      [DomainService.Handle]: (0, _handleApi.getHandleCryptoAddress)(receiverDomain),
      [DomainService.Unstoppable]: (0, _unstoppableApi.getUnstoppableCryptoAddress)(receiverDomain, (apiConfig === null || apiConfig === void 0 || (_apiConfig$apiKeys = apiConfig.apiKeys) === null || _apiConfig$apiKeys === void 0 ? void 0 : _apiConfig$apiKeys.unstoppableApiKey) ?? undefined),
      [DomainService.Cns]: (0, _cns.getCnsCryptoAddress)(receiverDomain)
    };
    if (resolutionStrategy === 'all') {
      const results = await Promise.all(Object.entries(operations).map(async _ref => {
        let [service, operation] = _ref;
        try {
          const address = await operation;
          return {
            error: null,
            address,
            service
          };
        } catch (error) {
          return {
            error: error.message,
            address: null,
            service
          };
        }
      }));
      return results;
    }
    const result = await Promise.any(Object.entries(operations).map(_ref2 => {
      let [service, operation] = _ref2;
      return operation.then(address => ({
        error: null,
        address,
        service
      }));
    })).catch(error => ({
      address: null,
      error,
      service: null
    }));
    return [result];
  };
  return {
    getCryptoAddress
  };
};
exports.resolverApiMaker = resolverApiMaker;
//# sourceMappingURL=api.js.map
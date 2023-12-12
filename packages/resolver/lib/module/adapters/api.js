import { getHandleCryptoAddress } from './handle-api';
import { getUnstoppableCryptoAddress } from './unstoppable-api';
import { getCnsCryptoAddress } from './cns';
export let DomainService = /*#__PURE__*/function (DomainService) {
  DomainService["Cns"] = "cns";
  DomainService["Unstoppable"] = "unstoppable";
  DomainService["Handle"] = "handle";
  return DomainService;
}({});
export const resolverApiMaker = (resolutionStrategy, apiConfig) => {
  const getCryptoAddress = async receiverDomain => {
    var _apiConfig$apiKeys;
    const operations = {
      [DomainService.Handle]: getHandleCryptoAddress(receiverDomain),
      [DomainService.Unstoppable]: getUnstoppableCryptoAddress(receiverDomain, (apiConfig === null || apiConfig === void 0 || (_apiConfig$apiKeys = apiConfig.apiKeys) === null || _apiConfig$apiKeys === void 0 ? void 0 : _apiConfig$apiKeys.unstoppableApiKey) ?? undefined),
      [DomainService.Cns]: getCnsCryptoAddress(receiverDomain)
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
//# sourceMappingURL=api.js.map
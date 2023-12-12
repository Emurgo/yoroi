import { resolverApiMaker } from '../adapters/api';
export const resolverModuleMaker = (resolutionStrategy, resolverStorage, apiConfig) => {
  const {
    notice
  } = resolverStorage;
  const api = resolverApiMaker(resolutionStrategy, apiConfig);
  return {
    address: {
      getCryptoAddress: api.getCryptoAddress
    },
    notice
  };
};
//# sourceMappingURL=module.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeSwapApi = void 0;
var _apiOpenswap = require("@yoroi/api-openswap");
var _transformers = require("./transformers");
const makeSwapApi = (_ref, deps) => {
  let {
    network,
    stakingKey
  } = _ref;
  const api = (deps === null || deps === void 0 ? void 0 : deps.openswap) ?? new _apiOpenswap.OpenSwapApi(network === 0 ? 'mainnet' : 'preprod');
  const getOrders = async () => api.getOrders(stakingKey).then(_transformers.asYoroiOrders);
  const createOrder = async orderData => {
    const orderRequest = {
      walletAddress: orderData.address,
      protocol: orderData.protocol,
      poolId: orderData.poolId,
      sell: (0, _transformers.asOpenswapAmount)(orderData.amounts.sell),
      buy: (0, _transformers.asOpenswapAmount)(orderData.amounts.buy)
    };
    return api.createOrder(orderRequest).then(response => {
      if (response.status === 'failed') return Promise.reject(response.reason ?? 'Unknown error');
      return Promise.resolve({
        datum: response.datum,
        datumHash: response.hash,
        contractAddress: response.address
      });
    });
  };
  const cancelOrder = async orderData => {
    const {
      address,
      utxos
    } = orderData;
    return api.cancelOrder({
      orderUTxO: utxos.order,
      collateralUTxO: utxos.collateral,
      walletAddress: address
    }).then(response => response);
  };

  // TODO: it should be abstracted by our own backend after our native assets have all data
  const getTokens = async token => api.getTokens((0, _transformers.asOpenswapTokenId)(token)).then(_transformers.asYoroiBalanceTokens);
  const getPools = async _ref2 => {
    let {
      tokenA,
      tokenB
    } = _ref2;
    return api.getPools({
      tokenA: (0, _transformers.asOpenswapTokenId)(tokenA),
      tokenB: (0, _transformers.asOpenswapTokenId)(tokenB)
    }).then(_transformers.asYoroiPools);
  };
  return {
    getOrders,
    cancelOrder,
    createOrder,
    getTokens,
    getPools
  };
};
exports.makeSwapApi = makeSwapApi;
//# sourceMappingURL=api.js.map
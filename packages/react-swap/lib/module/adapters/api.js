import { OpenSwapApi } from '@yoroi/api-openswap';
import { asOpenswapAmount, asOpenswapTokenId, asYoroiBalanceTokens, asYoroiOrders, asYoroiPools } from './transformers';
export const makeSwapApi = (_ref, deps) => {
  let {
    network,
    stakingKey
  } = _ref;
  const api = (deps === null || deps === void 0 ? void 0 : deps.openswap) ?? new OpenSwapApi(network === 0 ? 'mainnet' : 'preprod');
  const getOrders = async () => api.getOrders(stakingKey).then(asYoroiOrders);
  const createOrder = async orderData => {
    const orderRequest = {
      walletAddress: orderData.address,
      protocol: orderData.protocol,
      poolId: orderData.poolId,
      sell: asOpenswapAmount(orderData.amounts.sell),
      buy: asOpenswapAmount(orderData.amounts.buy)
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
  const getTokens = async token => api.getTokens(asOpenswapTokenId(token)).then(asYoroiBalanceTokens);
  const getPools = async _ref2 => {
    let {
      tokenA,
      tokenB
    } = _ref2;
    return api.getPools({
      tokenA: asOpenswapTokenId(tokenA),
      tokenB: asOpenswapTokenId(tokenB)
    }).then(asYoroiPools);
  };
  return {
    getOrders,
    cancelOrder,
    createOrder,
    getTokens,
    getPools
  };
};
//# sourceMappingURL=api.js.map
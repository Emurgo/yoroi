export const makeSwapManager = (swapStorage, swapApi) => {
  const {
    clear: clearStorage,
    slippage
  } = swapStorage;
  const {
    getPools,
    getOrders,
    getTokens,
    cancelOrder,
    createOrder
  } = swapApi;
  const order = {
    cancel: cancelOrder,
    create: createOrder,
    list: {
      byStatusOpen: getOrders
    }
  };
  const pairs = {
    list: {
      byToken: getTokens
    }
  };
  const pools = {
    list: {
      byPair: getPools
    }
  };
  return {
    clearStorage,
    slippage,
    order,
    pairs,
    pools
  };
};
//# sourceMappingURL=swapManager.js.map
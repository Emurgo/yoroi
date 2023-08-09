import { produce } from 'immer';
export let SwapCreateOrderActionType = /*#__PURE__*/function (SwapCreateOrderActionType) {
  SwapCreateOrderActionType["OrderTypeChanged"] = "orderTypeChanged";
  SwapCreateOrderActionType["FromAmountChanged"] = "fromAmountChanged";
  SwapCreateOrderActionType["ToAmountChanged"] = "toAmountChanged";
  SwapCreateOrderActionType["ProtocolChanged"] = "protocolChanged";
  SwapCreateOrderActionType["PoolIdChanged"] = "poolIdChanged";
  SwapCreateOrderActionType["SlippageChanged"] = "slippageChanged";
  SwapCreateOrderActionType["TxPayloadChanged"] = "txPayloadChanged";
  return SwapCreateOrderActionType;
}({});
export let SwapActionType = /*#__PURE__*/function (SwapActionType) {
  SwapActionType["UnsignedTxChanged"] = "unsignedTxChanged";
  SwapActionType["ResetState"] = "resetState";
  return SwapActionType;
}({});
export const combinedSwapReducers = (state, action) => {
  return {
    ...swapReducer({
      ...state,
      ...createOrderReducer(state, action)
    }, action)
  };
};
export const defaultSwapState = {
  createOrder: {
    type: 'limit',
    address: '',
    datum: '',
    datumHash: '',
    amounts: {
      sell: {
        quantity: '0',
        tokenId: ''
      },
      buy: {
        quantity: '0',
        tokenId: ''
      }
    },
    slippage: 0.1,
    protocol: 'muesliswap',
    poolId: ''
  },
  unsignedTx: undefined
};
const defaultSwapCreateOrderActions = {
  orderTypeChanged: _orderType => console.error('[swap-react] missing initialization'),
  fromAmountChanged: _fromAmount => console.error('[swap-react] missing initialization'),
  toAmountChanged: _toAmount => console.error('[swap-react] missing initialization'),
  protocolChanged: _protocol => console.error('[swap-react] missing initialization'),
  poolIdChanged: _poolId => console.error('[swap-react] missing initialization'),
  slippageChanged: _slippage => console.error('[swap-react] missing initialization'),
  txPayloadChanged: _txPayload => console.error('[swap-react] missing initialization')
};
const defaultStateActions = {
  unsignedTxChanged: _unsignedTx => console.error('[swap-react] missing initialization'),
  resetState: () => console.error('[swap-react] missing initialization')
};
export const defaultSwapActions = {
  ...defaultSwapCreateOrderActions,
  ...defaultStateActions
};
const createOrderReducer = (state, action) => {
  switch (action.type) {
    case SwapCreateOrderActionType.OrderTypeChanged:
      return produce(state.createOrder, draft => {
        draft.type = action.orderType;
      });
    case SwapCreateOrderActionType.FromAmountChanged:
      return produce(state.createOrder, draft => {
        draft.amounts.sell = action.fromAmount;
      });
    case SwapCreateOrderActionType.ToAmountChanged:
      return produce(state.createOrder, draft => {
        draft.amounts.buy = action.toAmount;
      });
    case SwapCreateOrderActionType.ProtocolChanged:
      return produce(state.createOrder, draft => {
        draft.protocol = action.protocol;
      });
    case SwapCreateOrderActionType.PoolIdChanged:
      return produce(state.createOrder, draft => {
        draft.poolId = action.poolId;
      });
    case SwapCreateOrderActionType.SlippageChanged:
      return produce(state.createOrder, draft => {
        draft.slippage = action.slippage;
      });
    case SwapCreateOrderActionType.TxPayloadChanged:
      return produce(state.createOrder, draft => {
        draft.datum = action.txPayload.datum;
        draft.datumHash = action.txPayload.datumHash;
        draft.address = action.txPayload.contractAddress;
      });
    default:
      return produce(state.createOrder, () => {});
  }
};
const swapReducer = (state, action) => {
  switch (action.type) {
    case SwapActionType.UnsignedTxChanged:
      return produce(state, draft => {
        draft.unsignedTx = action.unsignedTx;
      });
    case SwapActionType.ResetState:
      return produce(defaultSwapState, () => {});
    default:
      return produce(state, () => {});
  }
};
//# sourceMappingURL=swapState.js.map
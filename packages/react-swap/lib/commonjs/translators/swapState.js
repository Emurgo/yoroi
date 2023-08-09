"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultSwapState = exports.defaultSwapActions = exports.combinedSwapReducers = exports.SwapCreateOrderActionType = exports.SwapActionType = void 0;
var _immer = require("immer");
let SwapCreateOrderActionType = /*#__PURE__*/function (SwapCreateOrderActionType) {
  SwapCreateOrderActionType["OrderTypeChanged"] = "orderTypeChanged";
  SwapCreateOrderActionType["FromAmountChanged"] = "fromAmountChanged";
  SwapCreateOrderActionType["ToAmountChanged"] = "toAmountChanged";
  SwapCreateOrderActionType["ProtocolChanged"] = "protocolChanged";
  SwapCreateOrderActionType["PoolIdChanged"] = "poolIdChanged";
  SwapCreateOrderActionType["SlippageChanged"] = "slippageChanged";
  SwapCreateOrderActionType["TxPayloadChanged"] = "txPayloadChanged";
  return SwapCreateOrderActionType;
}({});
exports.SwapCreateOrderActionType = SwapCreateOrderActionType;
let SwapActionType = /*#__PURE__*/function (SwapActionType) {
  SwapActionType["UnsignedTxChanged"] = "unsignedTxChanged";
  SwapActionType["ResetState"] = "resetState";
  return SwapActionType;
}({});
exports.SwapActionType = SwapActionType;
const combinedSwapReducers = (state, action) => {
  return {
    ...swapReducer({
      ...state,
      ...createOrderReducer(state, action)
    }, action)
  };
};
exports.combinedSwapReducers = combinedSwapReducers;
const defaultSwapState = {
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
exports.defaultSwapState = defaultSwapState;
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
const defaultSwapActions = {
  ...defaultSwapCreateOrderActions,
  ...defaultStateActions
};
exports.defaultSwapActions = defaultSwapActions;
const createOrderReducer = (state, action) => {
  switch (action.type) {
    case SwapCreateOrderActionType.OrderTypeChanged:
      return (0, _immer.produce)(state.createOrder, draft => {
        draft.type = action.orderType;
      });
    case SwapCreateOrderActionType.FromAmountChanged:
      return (0, _immer.produce)(state.createOrder, draft => {
        draft.amounts.sell = action.fromAmount;
      });
    case SwapCreateOrderActionType.ToAmountChanged:
      return (0, _immer.produce)(state.createOrder, draft => {
        draft.amounts.buy = action.toAmount;
      });
    case SwapCreateOrderActionType.ProtocolChanged:
      return (0, _immer.produce)(state.createOrder, draft => {
        draft.protocol = action.protocol;
      });
    case SwapCreateOrderActionType.PoolIdChanged:
      return (0, _immer.produce)(state.createOrder, draft => {
        draft.poolId = action.poolId;
      });
    case SwapCreateOrderActionType.SlippageChanged:
      return (0, _immer.produce)(state.createOrder, draft => {
        draft.slippage = action.slippage;
      });
    case SwapCreateOrderActionType.TxPayloadChanged:
      return (0, _immer.produce)(state.createOrder, draft => {
        draft.datum = action.txPayload.datum;
        draft.datumHash = action.txPayload.datumHash;
        draft.address = action.txPayload.contractAddress;
      });
    default:
      return (0, _immer.produce)(state.createOrder, () => {});
  }
};
const swapReducer = (state, action) => {
  switch (action.type) {
    case SwapActionType.UnsignedTxChanged:
      return (0, _immer.produce)(state, draft => {
        draft.unsignedTx = action.unsignedTx;
      });
    case SwapActionType.ResetState:
      return (0, _immer.produce)(defaultSwapState, () => {});
    default:
      return (0, _immer.produce)(state, () => {});
  }
};
//# sourceMappingURL=swapState.js.map
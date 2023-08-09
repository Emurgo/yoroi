"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useSwapSlippage = exports.useSwapSettings = exports.useSwapSetSlippage = exports.useSwap = exports.SwapProvider = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactQuery = require("react-query");
var _storage = require("../adapters/storage");
var _swapState = require("./swapState");
var _swapManager = require("./swapManager.mocks");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const defaultSwapManager = _swapManager.mockSwapManagerDefault;
const initialSwapProvider = {
  ..._swapState.defaultSwapState,
  ..._swapState.defaultSwapActions,
  ...defaultSwapManager
};
const SwapContext = /*#__PURE__*/React.createContext(initialSwapProvider);
const SwapProvider = _ref => {
  let {
    children,
    swapManager,
    initialState
  } = _ref;
  const [state, dispatch] = React.useReducer(_swapState.combinedSwapReducers, {
    ..._swapState.defaultSwapState,
    ...initialState
  });
  const actions = React.useRef({
    orderTypeChanged: orderType => {
      dispatch({
        type: _swapState.SwapCreateOrderActionType.OrderTypeChanged,
        orderType
      });
    },
    fromAmountChanged: fromAmount => {
      dispatch({
        type: _swapState.SwapCreateOrderActionType.FromAmountChanged,
        fromAmount
      });
    },
    toAmountChanged: toAmount => {
      dispatch({
        type: _swapState.SwapCreateOrderActionType.ToAmountChanged,
        toAmount
      });
    },
    protocolChanged: protocol => {
      dispatch({
        type: _swapState.SwapCreateOrderActionType.ProtocolChanged,
        protocol
      });
    },
    poolIdChanged: poolId => {
      dispatch({
        type: _swapState.SwapCreateOrderActionType.PoolIdChanged,
        poolId
      });
    },
    slippageChanged: slippage => {
      dispatch({
        type: _swapState.SwapCreateOrderActionType.SlippageChanged,
        slippage
      });
    },
    txPayloadChanged: txPayload => {
      dispatch({
        type: _swapState.SwapCreateOrderActionType.TxPayloadChanged,
        txPayload
      });
    },
    unsignedTxChanged: unsignedTx => {
      dispatch({
        type: _swapState.SwapActionType.UnsignedTxChanged,
        unsignedTx
      });
    },
    resetState: () => {
      dispatch({
        type: _swapState.SwapActionType.ResetState
      });
    }
  }).current;
  const context = React.useMemo(() => ({
    ...state,
    ...actions,
    ...swapManager
  }), [state, actions, swapManager]);
  return /*#__PURE__*/React.createElement(SwapContext.Provider, {
    value: context
  }, children);
};
exports.SwapProvider = SwapProvider;
const useSwap = () => React.useContext(SwapContext) || invalidSwapContext();
exports.useSwap = useSwap;
const invalidSwapContext = () => {
  throw new Error('[swap-react] useSwapState must be used within a SwapProvider');
};

// * === SETTINGS ===
// * NOTE maybe it should be moved as part of wallet settings package
const useSwapSlippage = () => {
  const {
    slippage
  } = useSwap();
  const query = (0, _reactQuery.useQuery)({
    suspense: true,
    queryKey: [_storage.swapStorageSlippageKey],
    queryFn: slippage.read
  });
  if (query.data == null) throw new Error('[swap-react] useSwapSlippage invalid state');
  return query.data;
};
exports.useSwapSlippage = useSwapSlippage;
const useSwapSetSlippage = options => {
  const {
    slippage
  } = useSwap();
  const mutation = useMutationWithInvalidations({
    ...options,
    useErrorBoundary: true,
    mutationFn: slippage.save,
    invalidateQueries: [[_storage.swapStorageSlippageKey]]
  });
  return mutation.mutate;
};
exports.useSwapSetSlippage = useSwapSetSlippage;
const useSwapSettings = () => {
  const setSlippage = useSwapSetSlippage();
  const slippage = useSwapSlippage();
  const memoizedSetSlippage = React.useCallback(newSlippage => setSlippage(newSlippage, {
    // onSuccess: metrics.enable,
  }), [setSlippage]);
  return React.useMemo(() => ({
    slippage,
    setSlippage: memoizedSetSlippage
  }), [slippage, memoizedSetSlippage]);
};

// * === HOOKS ===
// * NOTE copied from wallet-mobile it should be imported from hooks package later
exports.useSwapSettings = useSwapSettings;
const useMutationWithInvalidations = function () {
  let {
    invalidateQueries,
    ...options
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const queryClient = (0, _reactQuery.useQueryClient)();
  return (0, _reactQuery.useMutation)({
    ...options,
    onMutate: variables => {
      var _options$onMutate;
      invalidateQueries === null || invalidateQueries === void 0 ? void 0 : invalidateQueries.forEach(key => queryClient.cancelQueries(key));
      return options === null || options === void 0 || (_options$onMutate = options.onMutate) === null || _options$onMutate === void 0 ? void 0 : _options$onMutate.call(options, variables);
    },
    onSuccess: (data, variables, context) => {
      var _options$onSuccess;
      invalidateQueries === null || invalidateQueries === void 0 ? void 0 : invalidateQueries.forEach(key => queryClient.invalidateQueries(key));
      return options === null || options === void 0 || (_options$onSuccess = options.onSuccess) === null || _options$onSuccess === void 0 ? void 0 : _options$onSuccess.call(options, data, variables, context);
    }
  });
};
//# sourceMappingURL=reactjs.js.map
import * as React from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { swapStorageSlippageKey } from '../adapters/storage';
import { SwapActionType, SwapCreateOrderActionType, combinedSwapReducers, defaultSwapActions, defaultSwapState } from './swapState';
import { mockSwapManagerDefault } from './swapManager.mocks';
const defaultSwapManager = mockSwapManagerDefault;
const initialSwapProvider = {
  ...defaultSwapState,
  ...defaultSwapActions,
  ...defaultSwapManager
};
const SwapContext = /*#__PURE__*/React.createContext(initialSwapProvider);
export const SwapProvider = _ref => {
  let {
    children,
    swapManager,
    initialState
  } = _ref;
  const [state, dispatch] = React.useReducer(combinedSwapReducers, {
    ...defaultSwapState,
    ...initialState
  });
  const actions = React.useRef({
    orderTypeChanged: orderType => {
      dispatch({
        type: SwapCreateOrderActionType.OrderTypeChanged,
        orderType
      });
    },
    fromAmountChanged: fromAmount => {
      dispatch({
        type: SwapCreateOrderActionType.FromAmountChanged,
        fromAmount
      });
    },
    toAmountChanged: toAmount => {
      dispatch({
        type: SwapCreateOrderActionType.ToAmountChanged,
        toAmount
      });
    },
    protocolChanged: protocol => {
      dispatch({
        type: SwapCreateOrderActionType.ProtocolChanged,
        protocol
      });
    },
    poolIdChanged: poolId => {
      dispatch({
        type: SwapCreateOrderActionType.PoolIdChanged,
        poolId
      });
    },
    slippageChanged: slippage => {
      dispatch({
        type: SwapCreateOrderActionType.SlippageChanged,
        slippage
      });
    },
    txPayloadChanged: txPayload => {
      dispatch({
        type: SwapCreateOrderActionType.TxPayloadChanged,
        txPayload
      });
    },
    unsignedTxChanged: unsignedTx => {
      dispatch({
        type: SwapActionType.UnsignedTxChanged,
        unsignedTx
      });
    },
    resetState: () => {
      dispatch({
        type: SwapActionType.ResetState
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
export const useSwap = () => React.useContext(SwapContext) || invalidSwapContext();
const invalidSwapContext = () => {
  throw new Error('[swap-react] useSwapState must be used within a SwapProvider');
};

// * === SETTINGS ===
// * NOTE maybe it should be moved as part of wallet settings package
export const useSwapSlippage = () => {
  const {
    slippage
  } = useSwap();
  const query = useQuery({
    suspense: true,
    queryKey: [swapStorageSlippageKey],
    queryFn: slippage.read
  });
  if (query.data == null) throw new Error('[swap-react] useSwapSlippage invalid state');
  return query.data;
};
export const useSwapSetSlippage = options => {
  const {
    slippage
  } = useSwap();
  const mutation = useMutationWithInvalidations({
    ...options,
    useErrorBoundary: true,
    mutationFn: slippage.save,
    invalidateQueries: [[swapStorageSlippageKey]]
  });
  return mutation.mutate;
};
export const useSwapSettings = () => {
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
const useMutationWithInvalidations = function () {
  let {
    invalidateQueries,
    ...options
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const queryClient = useQueryClient();
  return useMutation({
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
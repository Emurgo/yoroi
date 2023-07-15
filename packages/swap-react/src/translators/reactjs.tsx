import * as React from 'react'
import {
  QueryKey,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  useMutation,
} from 'react-query'
import {Balance, Swap} from '@yoroi/types'
import {makeMockSwapStorage} from '../adapters/mocks'
import {swapStorageSlippageKey} from '../adapters/storage'
import {produce} from 'immer'

type SwapState = Readonly<{
  createOrder: {
    type: Swap.OrderType
  } & Omit<Swap.CreateOrderData, 'address'>

  yoroiUnsignedTx: any | undefined
}>

type SwapCreateOrderActions = {
  updateOrderType: (orderType: Swap.OrderType) => void
  updateFromAmount: (fromAmount: Balance.Amount) => void
  updateToAmount: (toAmount: Balance.Amount) => void
  updateProtocol: (protocol: Swap.Protocol) => void
  updatePoolId: (poolId: string) => void
  updateSlippage: (slippage: number) => void
}

export enum SwapOrderActionType {
  ChangeOrderType = 'changeOrderType',
  ChangeAmountFrom = 'changeAmountFrom',
  ChangeAmountTo = 'changeAmountTo',
  ChangeProtocol = 'changeProtocol',
  ChangePoolId = 'changePoolId',
  ChangeSlippage = 'changeSlippage',
}

type SwapOrderAction =
  | {type: SwapOrderActionType.ChangeOrderType; orderType: Swap.OrderType}
  | {type: SwapOrderActionType.ChangeAmountFrom; fromAmount: Balance.Amount}
  | {type: SwapOrderActionType.ChangeAmountTo; toAmount: Balance.Amount}
  | {type: SwapOrderActionType.ChangeProtocol; protocol: Swap.Protocol}
  | {type: SwapOrderActionType.ChangePoolId; poolId: string}
  | {type: SwapOrderActionType.ChangeSlippage; slippage: number}

type SwapActions = {
  updateSwapUnsignedTx: (swapUnsignedTx: any | undefined) => void
  reset: () => void
}

enum SwapActionType {
  UpdateSwapUnsignedTx = 'updateSwapUnsignedTx',
  Reset = 'reset',
}

type SwapAction =
  | {
      type: SwapActionType.UpdateSwapUnsignedTx
      unsignedTx: any | undefined
    }
  | {type: SwapActionType.Reset}

const combinedReducers = (
  state: SwapState,
  action: SwapOrderAction | SwapAction,
) => {
  return {
    ...swapReducer(
      {
        ...state,
        ...createOrderReducer(state, action as SwapOrderAction),
      },
      action as SwapAction,
    ),
  } as const
}

const defaultState: SwapState = {
  createOrder: {
    type: 'limit',
    amounts: {
      sell: {
        quantity: '0',
        tokenId: '',
      },
      buy: {
        quantity: '0',
        tokenId: '',
      },
    },
    slippage: 0.1,
    protocol: 'muesliswap',
    poolId: '',
  },
  yoroiUnsignedTx: undefined,
} as const

const defaultSwapOrderActions: SwapCreateOrderActions = {
  updateOrderType: (_orderType: Swap.OrderType) =>
    console.error('[swap-react] missing initialization'),
  updateFromAmount: (_fromAmount: Balance.Amount) =>
    console.error('[swap-react] missing initialization'),
  updateToAmount: (_toAmount: Balance.Amount) =>
    console.error('[swap-react] missing initialization'),
  updateProtocol: (_protocol: Swap.Protocol) =>
    console.error('[swap-react] missing initialization'),
  updateSlippage: (_slippage: number) =>
    console.error('[swap-react] missing initialization'),
  updatePoolId: (_poolId: string) =>
    console.error('[swap-react] missing initialization'),
} as const

const defaultSwapActions: SwapActions = {
  updateSwapUnsignedTx: (_swapUnsignedTx: any | undefined) =>
    console.error('[swap-react] missing initialization'),
  reset: () => console.error('[swap-react] missing initialization'),
} as const

const defaultActions = {
  ...defaultSwapOrderActions,
  ...defaultSwapActions,
} as const

const defaultStorage: Swap.Storage = makeMockSwapStorage()

const initialSwapProvider: SwapProvider = {
  ...defaultState,
  ...defaultActions,
  ...defaultStorage,
}

type SwapProvider = React.PropsWithChildren<
  SwapState & SwapCreateOrderActions & SwapActions & Swap.Storage
>

const SwapContext = React.createContext<SwapProvider>(initialSwapProvider)

export const SwapProvider = ({
  children,
  storage,
  initialState,
}: {
  children: React.ReactNode
  storage: Readonly<Swap.Storage>
  initialState?: Readonly<Partial<SwapState>>
}) => {
  const [state, dispatch] = React.useReducer(combinedReducers, {
    ...defaultState,
    ...initialState,
  })
  const actions = React.useRef<SwapActions & SwapCreateOrderActions>({
    updateOrderType: (orderType: Swap.OrderType) => {
      dispatch({type: SwapOrderActionType.ChangeOrderType, orderType})
    },
    updateFromAmount: (fromAmount: Balance.Amount) => {
      dispatch({type: SwapOrderActionType.ChangeAmountFrom, fromAmount})
    },
    updateToAmount: (toAmount: Balance.Amount) => {
      dispatch({type: SwapOrderActionType.ChangeAmountTo, toAmount})
    },
    updateProtocol: (protocol: Swap.Protocol) => {
      dispatch({type: SwapOrderActionType.ChangeProtocol, protocol})
    },
    updatePoolId: (poolId: string) => {
      dispatch({type: SwapOrderActionType.ChangePoolId, poolId})
    },
    updateSlippage: (slippage: number) => {
      dispatch({type: SwapOrderActionType.ChangeSlippage, slippage})
    },
    updateSwapUnsignedTx: (unsignedTx: any | undefined) => {
      dispatch({
        type: SwapActionType.UpdateSwapUnsignedTx,
        unsignedTx: unsignedTx,
      })
    },
    reset: () => {
      dispatch({type: SwapActionType.Reset})
    },
  }).current

  const context = React.useMemo(
    () => ({...state, ...actions, ...storage}),
    [state, actions, storage],
  )

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>
}

function createOrderReducer(
  state: SwapState,
  action: SwapOrderAction,
): SwapState['createOrder'] {
  switch (action.type) {
    case SwapOrderActionType.ChangeOrderType:
      return produce(state.createOrder, (draft) => {
        draft.type = action.orderType
      })
    case SwapOrderActionType.ChangeAmountFrom:
      return produce(state.createOrder, (draft) => {
        draft.amounts.sell = action.fromAmount
      })
    case SwapOrderActionType.ChangeAmountTo:
      return produce(state.createOrder, (draft) => {
        draft.amounts.buy = action.toAmount
      })
    case SwapOrderActionType.ChangeProtocol:
      return produce(state.createOrder, (draft) => {
        draft.protocol = action.protocol
      })
    case SwapOrderActionType.ChangePoolId:
      return produce(state.createOrder, (draft) => {
        draft.poolId = action.poolId
      })
    case SwapOrderActionType.ChangeSlippage:
      return produce(state.createOrder, (draft) => {
        draft.slippage = action.slippage
      })
    default:
      return produce(state.createOrder, () => {})
  }
}
const swapReducer = (state: SwapState, action: SwapAction) => {
  switch (action.type) {
    case SwapActionType.UpdateSwapUnsignedTx:
      return produce(
        state,
        (draft) => (draft.yoroiUnsignedTx = action.unsignedTx),
      )
    case SwapActionType.Reset:
      return produce(defaultState, () => {})
    default:
      return produce(state, () => {})
  }
}

export const useSwap = () => {
  const value = React.useContext(SwapContext)
  if (!value) {
    throw new Error('[swap-react] useSwap must be used within a SwapProvider')
  }
  return value
}

// * === SETTINGS ===
// * NOTE maybe it should be moved as part of wallet settings package
export const useSwapSlippage = () => {
  const {slippage} = useSwap()
  const query = useQuery({
    suspense: true,
    queryKey: [swapStorageSlippageKey],
    queryFn: slippage.read,
  })

  if (query.data == null)
    throw new Error('[swap-react] useSwapSlippage invalid state')

  return query.data
}

export const useSwapSetSlippage = (
  options?: UseMutationOptions<void, Error, number>,
) => {
  const {slippage} = useSwap()
  const mutation = useMutationWithInvalidations<void, Error, number>({
    ...options,
    useErrorBoundary: true,
    mutationFn: slippage.save,
    invalidateQueries: [[swapStorageSlippageKey]],
  })

  return mutation.mutate
}

export const useSwapSettings = () => {
  const setSlippage = useSwapSetSlippage()
  const slippage = useSwapSlippage()

  const memoizedSetSlippage = React.useCallback(
    (newSlippage: number) =>
      setSlippage(newSlippage, {
        // onSuccess: metrics.enable,
      }),
    [setSlippage],
  )

  return React.useMemo(
    () => ({
      slippage,
      setSlippage: memoizedSetSlippage,
    }),
    [slippage, memoizedSetSlippage],
  )
}

// * === HOOKS ===
// * NOTE copied from wallet-mobile it should be imported from hooks package later
const useMutationWithInvalidations = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>({
  invalidateQueries,
  ...options
}: UseMutationOptions<TData, TError, TVariables, TContext> & {
  invalidateQueries?: Array<QueryKey>
} = {}) => {
  const queryClient = useQueryClient()

  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    onMutate: (variables) => {
      invalidateQueries?.forEach((key) => queryClient.cancelQueries(key))
      return options?.onMutate?.(variables)
    },
    onSuccess: (data, variables, context) => {
      invalidateQueries?.forEach((key) => queryClient.invalidateQueries(key))
      return options?.onSuccess?.(data, variables, context)
    },
  })
}

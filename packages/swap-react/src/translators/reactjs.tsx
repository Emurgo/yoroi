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
  typeChanged: (orderType: Swap.OrderType) => void
  amountFromChanged: (amountFrom: Balance.Amount) => void
  amountToChanged: (amountTo: Balance.Amount) => void
  protocolChanged: (protocol: Swap.Protocol) => void
  poolIdChanged: (poolId: string) => void
  slippageChanged: (slippage: number) => void
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
  | {type: SwapOrderActionType.ChangeAmountFrom; amountFrom: Balance.Amount}
  | {type: SwapOrderActionType.ChangeAmountTo; amountTo: Balance.Amount}
  | {type: SwapOrderActionType.ChangeProtocol; protocol: Swap.Protocol}
  | {type: SwapOrderActionType.ChangePoolId; poolId: string}
  | {type: SwapOrderActionType.ChangeSlippage; slippage: number}

type SwapActions = {
  yoroiUnsignedTxChanged: (yoroiUnsignedTx: any | undefined) => void
  resetForm: () => void
}

type SwapAction =
  | {type: 'yoroiUnsignedTxChanged'; yoroiUnsignedTx: any | undefined}
  | {type: 'resetForm'}

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
  typeChanged: (_orderType: Swap.OrderType) =>
    console.error('[swap-react] missing initialization'),
  amountFromChanged: (_amountFrom: Balance.Amount) =>
    console.error('[swap-react] missing initialization'),
  amountToChanged: (_amountTo: Balance.Amount) =>
    console.error('[swap-react] missing initialization'),
  protocolChanged: (_protocol: Swap.Protocol) =>
    console.error('[swap-react] missing initialization'),
  slippageChanged: (_slippage: number) =>
    console.error('[swap-react] missing initialization'),
  poolIdChanged: (_poolId: string) =>
    console.error('[swap-react] missing initialization'),
} as const

const defaultSwapActions: SwapActions = {
  yoroiUnsignedTxChanged: (_yoroiUnsignedTx: any | undefined) =>
    console.error('[swap-react] missing initialization'),
  resetForm: () => console.error('[swap-react] missing initialization'),
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
    typeChanged: (orderType: Swap.OrderType) => {
      dispatch({type: SwapOrderActionType.ChangeOrderType, orderType})
    },
    amountFromChanged: (amountFrom: Balance.Amount) => {
      dispatch({type: SwapOrderActionType.ChangeAmountFrom, amountFrom})
    },
    amountToChanged: (amountTo: Balance.Amount) => {
      dispatch({type: SwapOrderActionType.ChangeAmountTo, amountTo})
    },
    protocolChanged: (protocol: Swap.Protocol) => {
      dispatch({type: SwapOrderActionType.ChangeProtocol, protocol})
    },
    poolIdChanged: (poolId: string) => {
      dispatch({type: SwapOrderActionType.ChangePoolId, poolId})
    },
    slippageChanged: (slippage: number) => {
      dispatch({type: SwapOrderActionType.ChangeSlippage, slippage})
    },
    yoroiUnsignedTxChanged: (yoroiUnsignedTx: any | undefined) => {
      dispatch({type: 'yoroiUnsignedTxChanged', yoroiUnsignedTx})
    },
    resetForm: () => {
      dispatch({type: 'resetForm'})
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
        draft.amounts.sell = action.amountFrom
      })
    case SwapOrderActionType.ChangeAmountTo:
      return produce(state.createOrder, (draft) => {
        draft.amounts.buy = action.amountTo
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
    case 'yoroiUnsignedTxChanged':
      return {
        ...state,
        yoroiUnsignedTx: action.yoroiUnsignedTx,
      }
    case 'resetForm':
      return {...defaultState}
    default:
      return {...state}
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

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
type SwapOrderAction =
  | {type: 'typeChanged'; orderType: Swap.OrderType}
  | {type: 'amountFromChanged'; amountFrom: Balance.Amount}
  | {type: 'amountToChanged'; amountTo: Balance.Amount}
  | {type: 'protocolChanged'; protocol: Swap.Protocol}
  | {type: 'poolIdChanged'; poolId: string}
  | {type: 'slippageChanged'; slippage: number}

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
  // ...defaultMetrics,
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
      dispatch({type: 'typeChanged', orderType})
    },
    amountFromChanged: (amountFrom: Balance.Amount) => {
      dispatch({type: 'amountFromChanged', amountFrom})
    },
    amountToChanged: (amountTo: Balance.Amount) => {
      dispatch({type: 'amountToChanged', amountTo})
    },
    protocolChanged: (protocol: Swap.Protocol) => {
      dispatch({type: 'protocolChanged', protocol})
    },
    poolIdChanged: (poolId: string) => {
      dispatch({type: 'poolIdChanged', poolId})
    },
    slippageChanged: (slippage: number) => {
      dispatch({type: 'slippageChanged', slippage})
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

function createOrderReducer(state: SwapState, action: SwapOrderAction): SwapState['createOrder'] {
  switch (action.type) {
    case 'typeChanged':
      return {
        createOrder: {
          ...state.createOrder,
          type: action.orderType,
        },
      }
    case 'amountFromChanged':
      return {
        createOrder: {
          ...state.order,
          amounts: {
            ...state.order.amounts,
            sell: action.amountFrom,
          },
        },
      }
    case 'amountToChanged':
      return {
        createOrder: {
          ...state.order,
          amountTo: action.amountTo,
        },
      }
    case 'protocolChanged':
      return {
        createOrder: {
          ...state.order,
          protocol: action.protocol,
        },
      }
    case 'poolIdChanged':
      return {
        createOrder: {
          ...state.order,
          poolId: action.poolId,
        },
      }
    case 'slippageChanged':
      return {
        createOrder: {
          ...state.order,
          slippage: action.slippage,
        },
      }
    default:
      return {
        createOrder: {
          ...state.order,
        },
      }
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

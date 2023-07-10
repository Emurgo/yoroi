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

type SwapState = {
  order: {
    type: Swap.OrderType
    amountFrom: Balance.Amount
    amountTo: Balance.Amount
    protocol: Swap.Protocol
    slippage: number
  }

  yoroiUnsignedTx: any | undefined
}
type SwapOrderActions = {
  typeChanged: (orderType: Swap.OrderType) => void
  amountFromChanged: (amountFrom: Balance.Amount) => void
  amountToChanged: (amountTo: Balance.Amount) => void
  protocolChanged: (protocol: Swap.Protocol) => void
  slippageChanged: (slippage: number) => void
}
type SwapOrderAction =
  | {type: 'typeChanged'; orderType: Swap.OrderType}
  | {type: 'amountFromChanged'; amountFrom: Balance.Amount}
  | {type: 'amountToChanged'; amountTo: Balance.Amount}
  | {type: 'protocolChanged'; protocol: Swap.Protocol}
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
        ...orderReducer(state, action as SwapOrderAction),
      },
      action as SwapAction,
    ),
  } as const
}

const defaultState: SwapState = {
  order: {
    type: 'limit',
    amountFrom: {
      quantity: '0',
      tokenId: '',
    },
    amountTo: {
      quantity: '0',
      tokenId: '',
    },
    protocol: 'muesliswap',
    slippage: 0.1,
  },
  yoroiUnsignedTx: undefined,
} as const
const defaultSwapOrderActions: SwapOrderActions = {
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
// const defaultMetrics: Swap.Module<Amplitude.Types.EventOptions> =
//   makeMockMetrics({
//     apiKey: 'mocked-api-key',
//   })
const defaultStorage: Swap.Storage = makeMockSwapStorage()
const initialSwapProvider: SwapProvider = {
  ...defaultState,
  ...defaultActions,
  // ...defaultMetrics,
  ...defaultStorage,
}

type SwapProvider = React.PropsWithChildren<
  SwapState & SwapOrderActions & SwapActions & Swap.Storage
>
const SwapContext = React.createContext<SwapProvider>(initialSwapProvider)
export const SwapProvider = ({
  children,
  // swap,
  storage,
  initialState,
}: {
  children: React.ReactNode
  // swap: Readonly<Swap.Module<Amplitude.Types.EventOptions>>
  storage: Readonly<Swap.Storage>
  initialState?: Readonly<Partial<SwapState>>
}) => {
  const [state, dispatch] = React.useReducer(combinedReducers, {
    ...defaultState,
    ...initialState,
  })
  const actions = React.useRef<SwapActions & SwapOrderActions>({
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

function orderReducer(state: SwapState, action: SwapOrderAction) {
  switch (action.type) {
    case 'typeChanged':
      return {
        order: {
          ...state.order,
          type: action.orderType,
        },
      }
    case 'amountFromChanged':
      return {
        order: {
          ...state.order,
          amountFrom: action.amountFrom,
        },
      }
    case 'amountToChanged':
      return {
        order: {
          ...state.order,
          amountTo: action.amountTo,
        },
      }
    case 'protocolChanged':
      return {
        order: {
          ...state.order,
          protocol: action.protocol,
        },
      }
    case 'slippageChanged':
      return {
        order: {
          ...state.order,
          slippage: action.slippage,
        },
      }
    default:
      return {
        order: {
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

import * as React from 'react'
import {
  QueryKey,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  useMutation,
} from 'react-query'
import {Swap} from '@yoroi/types'

import {makeMockSwapStorage} from '../adapters/mocks'
import {swapStorageSlippageKey} from '../adapters/storage'

type SwapState = {
  sessionId: number
  orderType: Swap.OrderType
}
type SwapActions = {
  sessionIdChanged: (sessionId: number) => void
}

type SwapProvider = React.PropsWithChildren<
  SwapState & SwapActions & Swap.Storage
>

const defaultState: SwapState = {
  sessionId: new Date().getTime(),
} as const
const defaultActions: SwapActions = {
  sessionIdChanged: (_sessionId: number) =>
    console.error('[swap-react] missing initialization'),
} as const
// const defaultMetrics: Swap.Module<Amplitude.Types.EventOptions> =
//   makeMockMetrics({
//     apiKey: 'mocked-api-key',
//   })
const defaultStorage: Swap.Storage = makeMockSwapStorage()
const initialMetricsProvider: SwapProvider = {
  ...defaultState,
  ...defaultActions,
  // ...defaultMetrics,
  ...defaultStorage,
}

const SwapContext = React.createContext<SwapProvider>(initialMetricsProvider)

export const useSwap = () => {
  const value = React.useContext(SwapContext)
  if (!value) {
    throw new Error('[swap-react] useSwap must be used within a SwapProvider')
  }
  return value
}

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
  const [state, dispatch] = React.useReducer(metricsReducer, {
    ...defaultState,
    ...initialState,
  })
  const actions = React.useRef<SwapActions>({
    sessionIdChanged: (sessionId: number) => {
      // swap.setSessionId(sessionId)
      dispatch({type: 'sessionIdChanged', sessionId})
    },
  }).current

  const context = React.useMemo(
    () => ({...state, ...actions, ...storage}),
    [state, actions, storage],
  )

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>
}

type SwapAction = {type: 'sessionIdChanged'; sessionId: number}

function metricsReducer(state: SwapState, action: SwapAction) {
  switch (action.type) {
    case 'sessionIdChanged':
      const {sessionId} = action
      return {...state, sessionId}

    default:
      throw new Error('[swap-react] metricsReducer invalid action')
  }
}

// * === SETTINGS ===
// * NOTE maybe it should be moved as part of wallet settings package
export const useSwapSlippage = (storage: Swap.Storage) => {
  const query = useQuery({
    suspense: true,
    queryKey: [swapStorageSlippageKey],
    queryFn: storage.slippage.read,
  })

  if (query.data == null)
    throw new Error('[swap-react] useSwapSlippage invalid state')

  return query.data
}

export const useSwapSetSlippage = (
  storage: Swap.Storage,
  options?: UseMutationOptions<void, Error, number>,
) => {
  const mutation = useMutationWithInvalidations<void, Error, number>({
    ...options,
    useErrorBoundary: true,
    mutationFn: storage.slippage.save,
    invalidateQueries: [[swapStorageSlippageKey]],
  })

  return mutation.mutate
}

export const useSwapSettings = (storage: Swap.Storage) => {
  const setSlippage = useSwapSetSlippage(storage)
  const slippage = useSwapSlippage(storage)

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

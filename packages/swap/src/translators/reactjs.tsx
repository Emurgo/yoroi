import * as React from 'react'
import {
  QueryKey,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  useMutation,
  UseQueryOptions,
} from 'react-query'
import {Balance, Swap} from '@yoroi/types'
import {swapStorageSlippageKey} from '../adapters/storage'
import {
  SwapActionType,
  SwapActions,
  SwapCreateOrderActionType,
  SwapCreateOrderActions,
  SwapState,
  combinedSwapReducers,
  defaultSwapActions,
  defaultSwapState,
} from './swapState'
import {mockSwapManagerDefault} from './swapManager.mocks'

const defaultSwapManager: Swap.Manager = mockSwapManagerDefault

type SwapProviderContext = React.PropsWithChildren<
  SwapState & SwapCreateOrderActions & SwapActions & Swap.Manager
>

const initialSwapProvider: SwapProviderContext = {
  ...defaultSwapState,
  ...defaultSwapActions,
  ...defaultSwapManager,
}

const SwapContext =
  React.createContext<SwapProviderContext>(initialSwapProvider)

export const SwapProvider = ({
  children,
  swapManager,
  initialState,
}: {
  children: React.ReactNode
  swapManager: Readonly<Swap.Manager>
  initialState?: Readonly<Partial<SwapState>>
}) => {
  const [state, dispatch] = React.useReducer(combinedSwapReducers, {
    ...defaultSwapState,
    ...initialState,
  })
  const actions = React.useRef<SwapActions & SwapCreateOrderActions>({
    orderTypeChanged: (orderType: Swap.OrderType) => {
      dispatch({type: SwapCreateOrderActionType.OrderTypeChanged, orderType})
    },
    sellAmountChanged: (amount: Balance.Amount) => {
      dispatch({type: SwapCreateOrderActionType.SellAmountChanged, amount})
    },
    buyAmountChanged: (amount: Balance.Amount) => {
      dispatch({type: SwapCreateOrderActionType.BuyAmountChanged, amount})
    },
    protocolChanged: (protocol: Swap.Protocol) => {
      dispatch({type: SwapCreateOrderActionType.ProtocolChanged, protocol})
    },
    poolIdChanged: (poolId: string) => {
      dispatch({type: SwapCreateOrderActionType.PoolIdChanged, poolId})
    },
    slippageChanged: (slippage: number) => {
      dispatch({type: SwapCreateOrderActionType.SlippageChanged, slippage})
    },
    txPayloadChanged: (txPayload: Swap.CreateOrderResponse) => {
      dispatch({type: SwapCreateOrderActionType.TxPayloadChanged, txPayload})
    },
    unsignedTxChanged: (unsignedTx: any) => {
      dispatch({type: SwapActionType.UnsignedTxChanged, unsignedTx})
    },
    resetState: () => {
      dispatch({type: SwapActionType.ResetState})
    },
    switchTokens: () => {
      dispatch({type: SwapActionType.SwitchTokens})
    },
  }).current

  const context = React.useMemo(
    () => ({...state, ...actions, ...swapManager}),
    [state, actions, swapManager],
  )

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>
}

export const useSwap = () =>
  React.useContext(SwapContext) || invalidSwapContext()

const invalidSwapContext = () => {
  throw new Error(
    '[swap-react] useSwapState must be used within a SwapProvider',
  )
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
export const useOrderByStatusOpen = (
  options: UseQueryOptions<Swap.OpenOrder[], Error>,
) => {
  const {order} = useSwap()
  const query = useQuery({
    suspense: true,
    queryKey: [],
    queryFn: order.list.byStatusOpen,
    ...options,
  })

  if (query.data == null)
    throw new Error('[swap-react] useOrderByStatusOpen invalid state')

  return query.data
}

export const usePairListByToken = (
  tokenIdBase: Balance.Token['info']['id'],
  options: UseQueryOptions<
    Balance.Token[],
    Error,
    Balance.Token[],
    ['usePairListByToken', string]
  >,
) => {
  const {pairs} = useSwap()
  const query = useQuery({
    suspense: true,
    ...options,
    queryKey: ['usePairListByToken', tokenIdBase],
    queryFn: () => pairs.list.byToken(tokenIdBase),
  })

  return {
    ...query,
    pairsByToken: query.data,
  }
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

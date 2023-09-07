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
import {BalanceToken} from '@yoroi/types/lib/balance/token'
import {SwapPoolPair} from '@yoroi/types/lib/swap/pool'
import {BalanceQuantity} from '@yoroi/types/src/balance/token'

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
  const {slippage: defaultSlippage, setSlippage} = useSwapSettings(swapManager)
  const slippage =
    defaultSlippage ??
    initialState?.createOrder?.slippage ??
    defaultSwapState.createOrder.slippage
  const [state, dispatch] = React.useReducer(combinedSwapReducers, {
    ...defaultSwapState,
    ...initialState,
    createOrder: {
      ...defaultSwapState.createOrder,
      ...initialState,
      slippage,
    },
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
    selectedPoolChanged: (pool: Swap.PoolPair) => {
      dispatch({type: SwapCreateOrderActionType.SelectedPoolChanged, pool})
    },
    slippageChanged: (newSlippage: number) => {
      setSlippage(newSlippage)
      dispatch({
        type: SwapCreateOrderActionType.SlippageChanged,
        slippage: newSlippage,
      })
    },
    txPayloadChanged: (txPayload: Swap.CreateOrderResponse) => {
      dispatch({type: SwapCreateOrderActionType.TxPayloadChanged, txPayload})
    },
    switchTokens: () => {
      dispatch({type: SwapCreateOrderActionType.SwitchTokens})
    },
    resetQuantities: () => {
      dispatch({type: SwapCreateOrderActionType.ResetQuantities})
    },
    unsignedTxChanged: (unsignedTx: any) => {
      dispatch({type: SwapActionType.UnsignedTxChanged, unsignedTx})
    },
    resetState: () => {
      dispatch({type: SwapActionType.ResetState})
    },
    limitPriceChanged: (limitPrice: BalanceQuantity) => {
      dispatch({type: SwapCreateOrderActionType.LimitPriceChanged, limitPrice})
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
    '[@yoroi/swap] useSwapState must be used within a SwapProvider',
  )
}

// * === SETTINGS ===
// * NOTE maybe it should be moved as part of wallet settings package
export const useSwapSlippage = (swapManager: Readonly<Swap.Manager>) => {
  const query = useQuery({
    suspense: true,
    queryKey: [swapStorageSlippageKey],
    queryFn: swapManager.slippage.read,
  })

  if (query.data == null)
    throw new Error('[@yoroi/swap] useSwapSlippage invalid state')

  return query.data
}

export const useOrderByStatusOpen = (
  args: {stakeKeyHash: string},
  options?: UseQueryOptions<
    Swap.OpenOrder[],
    Error,
    Swap.OpenOrder[],
    ['useOrderByStatusOpen', any]
  >,
) => {
  const {order} = useSwap()
  const query = useQuery({
    suspense: true,
    queryKey: ['useOrderByStatusOpen', args],
    queryFn: () => order.list.byStatusOpen(args),
    ...options,
  })

  if (query.data == null)
    throw new Error('[@yoroi/swap] useOrderByStatusOpen invalid state')

  return {
    ...query,
    openOrders: query.data,
  }
}

export const useCreateOrder = (
  options?: UseMutationOptions<
    Swap.CreateOrderResponse,
    Error,
    Swap.CreateOrderData
  >,
) => {
  const {order} = useSwap()

  const mutation = useMutationWithInvalidations({
    mutationFn: (orderData) => order.create(orderData),
    invalidateQueries: ['useCreateOrder'],
    ...options,
  })

  return {
    createOrderData: mutation.mutate,
    ...mutation,
  }
}

export const useOrderByStatusCompleted = (
  args: {stakeKeyHash: string},
  options?: UseQueryOptions<
    Swap.OpenOrder[],
    Error,
    Swap.OpenOrder[],
    ['useOrderByStatusCompleted', any]
  >,
) => {
  const {order} = useSwap()
  const query = useQuery({
    suspense: true,
    queryKey: ['useOrderByStatusCompleted', args],
    queryFn: () => order.list.byStatusCompleted(args),
    ...options,
  })

  if (query.data == null)
    throw new Error('[@yoroi/swap] useOrderByStatusOpen invalid state')

  return query.data
}

export const usePairListByToken = (
  tokenIdBase: Balance.Token['info']['id'],
  options?: UseQueryOptions<
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

export const usePoolsByPair = (
  tokenPair: {
    tokenA: BalanceToken['info']['id']
    tokenB: BalanceToken['info']['id']
  },
  options?: UseQueryOptions<
    SwapPoolPair[],
    Error,
    SwapPoolPair[],
    [
      'usePoolsByPair',
      {
        tokenA: BalanceToken['info']['id']
        tokenB: BalanceToken['info']['id']
      },
    ]
  >,
) => {
  const {pools} = useSwap()
  const query = useQuery({
    suspense: true,
    ...options,
    queryKey: ['usePoolsByPair', tokenPair],
    queryFn: () => pools.list.byPair(tokenPair),
  })

  return {
    ...query,
    poolList: query.data,
  }
}

export const useSwapSetSlippage = (
  swapManager: Readonly<Swap.Manager>,
  options?: UseMutationOptions<void, Error, number>,
) => {
  const mutation = useMutationWithInvalidations<void, Error, number>({
    ...options,
    useErrorBoundary: true,
    mutationFn: swapManager.slippage.save,
    invalidateQueries: [[swapStorageSlippageKey]],
  })

  return mutation.mutate
}

export const useSwapSettings = (swapManager: Readonly<Swap.Manager>) => {
  const setSlippage = useSwapSetSlippage(swapManager)
  const slippage = useSwapSlippage(swapManager)

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

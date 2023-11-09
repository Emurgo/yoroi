import {Balance, Swap} from '@yoroi/types'
import {apiMocks} from './adapters/openswap-api/api.mocks'

const loading = () => new Promise(() => {})
const unknownError = () => Promise.reject(new Error('Unknown error'))
const delayedResponse = <T = never>({
  data,
  timeout = 3000,
}: {
  data: T
  timeout?: number
}) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(data), timeout)
  })

// API RESPONSES
const createOrderResponse: Swap.CreateOrderResponse = {
  datum: 'some-datum',
  datumHash: 'some-hash',
  contractAddress: 'some-address',
}
const cancelOrderResponse: string = 'cbor'
const listOrdersByStatusOpenResponse: Swap.OpenOrderResponse =
  apiMocks.getOpenOrders
const listOrdersByStatusCompletedResponse: Swap.CompletedOrderResponse =
  apiMocks.getCompletedOrders
const listPoolsByPairResponse: Swap.PoolResponse = apiMocks.getPools
const listTokensByPairResponse: Balance.Token[] = apiMocks.getTokenPairs
const listOnlyVerifiedTokensResponse: Balance.TokenInfo[] = apiMocks.getTokens

// API FUNCTIONS
const createOrder = {
  success: () => Promise.resolve(createOrderResponse),
  delayed: (timeout: number) =>
    delayedResponse({data: createOrderResponse, timeout}),
  loading,
  error: {
    unknown: unknownError,
  },
}

const cancelOrder = {
  success: () => Promise.resolve(cancelOrderResponse),
  delayed: (timeout?: number) =>
    delayedResponse({data: cancelOrderResponse, timeout}),
  loading,
  error: {
    unknown: unknownError,
  },
}

const getOpenOrders = {
  success: () => Promise.resolve(listOrdersByStatusOpenResponse),
  delayed: (timeout?: number) =>
    delayedResponse({data: listOrdersByStatusOpenResponse, timeout}),
  empty: () => Promise.resolve([]),
  loading,
  error: {
    unknown: unknownError,
  },
}

const getCompletedOrders = {
  success: () => Promise.resolve(listOrdersByStatusCompletedResponse),
  delayed: (timeout?: number) =>
    delayedResponse({data: listOrdersByStatusCompletedResponse, timeout}),
  empty: () => Promise.resolve([]),
  loading,
  error: {
    unknown: unknownError,
  },
}

const getPools = {
  success: () => Promise.resolve(listPoolsByPairResponse),
  delayed: (timeout?: number) =>
    delayedResponse({data: listPoolsByPairResponse, timeout}),
  empty: () => Promise.resolve([]),
  loading,
  error: {
    unknown: unknownError,
  },
}

const getPrice = {
  success: () => Promise.resolve(1),
  delayed: (timeout?: number) => delayedResponse({data: 1, timeout}),
  empty: () => Promise.resolve(),
  loading,
  error: {
    unknown: unknownError,
  },
}

const getTokenPairs = {
  success: () => Promise.resolve(listTokensByPairResponse),
  delayed: (timeout?: number) =>
    delayedResponse({data: listTokensByPairResponse, timeout}),
  empty: () => Promise.resolve([]),
  loading,
  error: {
    unknown: unknownError,
  },
}

const getTokens = {
  success: () => Promise.resolve(listOnlyVerifiedTokensResponse),
  delayed: (timeout?: number) =>
    delayedResponse({data: listOnlyVerifiedTokensResponse, timeout}),
  empty: () => Promise.resolve([]),
  loading,
  error: {
    unknown: unknownError,
  },
}

// STORAGE RESPONSES
const slippageResponse = 0.1

// STORAGE FUNCTIONS
const slippage = {
  success: {
    read: () => Promise.resolve(slippageResponse),
    remove: () => Promise.resolve(),
    save: () => Promise.resolve(),
    key: 'mock-swap-slippage',
  },
  empty: {
    read: () => Promise.resolve(undefined),
    remove: () => Promise.resolve(),
    save: () => Promise.resolve(),
    key: 'mock-swap-slippage',
  },
  error: {
    unknown: {
      read: unknownError,
      remove: unknownError,
      save: unknownError,
      key: 'mock-swap-slippage',
    },
  },
}

const clear = {
  success: () => Promise.resolve(),
  error: {
    unknown: unknownError,
  },
}

// MOCKS
export const swapManagerMocks = {
  cancelOrderResponse,
  createOrderResponse,
  listOrdersByStatusOpenResponse,
  listOrdersByStatusCompletedResponse,
  listPoolsByPairResponse,
  listTokensByPairResponse,
  listOnlyVerifiedTokensResponse,

  slippageResponse,

  createOrder,
  cancelOrder,
  getPrice,
  getOpenOrders,
  getCompletedOrders,
  getPools,
  getTokenPairs,
  getTokens,

  slippage,
  clear,
}

export const mockSwapManager: Swap.Manager = {
  order: {
    create: createOrder.success,
    cancel: cancelOrder.success,
    list: {
      byStatusOpen: getOpenOrders.success,
      byStatusCompleted: getCompletedOrders.success,
    },
  },
  pools: {
    list: {
      byPair: getPools.success,
    },
  },
  tokens: {
    list: {
      byPair: getTokenPairs.success,
      onlyVerified: getTokens.success,
    },
  },
  price: {
    byPair: getPrice.success,
  },
  slippage: slippage.success,
  clearStorage: clear.success,
  primaryTokenId: '',
  stakingKey: '',
  supportedProviders: [] as const,
  aggregator: 'muesliswap',
  aggregatorTokenId: '',
  frontendFeeTiers: [] as const,
} as const

export const mockSwapManagerDefault: Swap.Manager = {
  order: {
    create: createOrder.error.unknown,
    cancel: cancelOrder.error.unknown,
    list: {
      byStatusOpen: getOpenOrders.error.unknown,
      byStatusCompleted: getCompletedOrders.error.unknown,
    },
  },
  pools: {
    list: {
      byPair: getPools.error.unknown,
    },
  },
  price: {
    byPair: getPrice.error.unknown,
  },
  tokens: {
    list: {
      byPair: getTokenPairs.error.unknown,
      onlyVerified: getTokens.error.unknown,
    },
  },
  slippage: slippage.error.unknown,
  clearStorage: clear.error.unknown,
  primaryTokenId: '',
  stakingKey: '',
  supportedProviders: [] as const,
  frontendFeeTiers: [] as const,
  aggregatorTokenId: '',
  aggregator: 'muesliswap',
} as const

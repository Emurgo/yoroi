import {Balance, Swap} from '@yoroi/types'
import {apiMocks} from './adapters/openswap-api/api.mocks'

const loading = () => new Promise(() => {})
const unknownError = () => Promise.reject('Unknown error')
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
const listPairsByTokenResponse: Balance.Token[] = apiMocks.getTokens

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

const getTokens = {
  success: () => Promise.resolve(listPairsByTokenResponse),
  delayed: (timeout?: number) =>
    delayedResponse({data: listPairsByTokenResponse, timeout}),
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
  listPairsByTokenResponse,

  slippageResponse,

  createOrder,
  cancelOrder,
  getOpenOrders,
  getCompletedOrders,
  getPools,
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
  pairs: {
    list: {
      byToken: getTokens.success,
    },
  },
  slippage: slippage.success,
  clearStorage: clear.success,
  primaryTokenId: '',
  stakingKey: '',
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
  pairs: {
    list: {
      byToken: getTokens.error.unknown,
    },
  },
  slippage: slippage.error.unknown,
  clearStorage: clear.error.unknown,
  primaryTokenId: '',
  stakingKey: '',
} as const

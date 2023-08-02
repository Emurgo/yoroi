import {Balance, Swap} from '@yoroi/types'

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
const listOrdersByStatusOpenResponse: Swap.OpenOrder[] = []

const listPoolsByPairResponse: Swap.Pool[] = []

const listPairsByTokenResponse: Balance.Token[] = []

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

const getOrders = {
  success: () => Promise.resolve(listOrdersByStatusOpenResponse),
  delayed: (timeout?: number) =>
    delayedResponse({data: listOrdersByStatusOpenResponse, timeout}),
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
  listPoolsByPairResponse,
  listPairsByTokenResponse,

  slippageResponse,

  createOrder,
  cancelOrder,
  getOrders,
  getPools,
  getTokens,

  slippage,
  clear,
}

export const mockSwapManager: Readonly<Swap.Manager> = {
  order: {
    create: createOrder.success,
    cancel: cancelOrder.success,
    list: {
      byStatusOpen: getOrders.success,
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
}

export const mockSwapManagerDefault: Readonly<Swap.Manager> = {
  order: {
    create: createOrder.error.unknown,
    cancel: cancelOrder.error.unknown,
    list: {
      byStatusOpen: getOrders.error.unknown,
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
}

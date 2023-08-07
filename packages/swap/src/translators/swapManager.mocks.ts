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
const listOrdersByStatusOpenResponse: Swap.OpenOrder[] = [
  {
    provider: 'minswap',
    deposit: {
      quantity: '0',
      tokenId: '',
    },
    from: {
      quantity: '0',
      tokenId: '',
    },
    to: {
      quantity: '0',
      tokenId: '',
    },
    utxo: 'utxo',
  },
]

const listPoolsByPairResponse: Swap.Pool[] = [
  {
    poolId: 'pool-id',
    tokenA: {
      quantity: '0',
      tokenId: '',
    },
    tokenB: {
      quantity: '0',
      tokenId: '',
    },
    provider: 'minswap',
    lastUpdate: '1690983915581',
    price: 1.1234456789,
    batcherFee: {
      quantity: '0',
      tokenId: '',
    },
    deposit: {
      quantity: '0',
      tokenId: '',
    },
    fee: {
      quantity: '0',
      tokenId: '',
    },
    lpToken: {
      quantity: '0',
      tokenId: '',
    },
  },
]

const listPairsByTokenResponse: Balance.Token[] = [
  {
    info: {
      name: 'some-name',
      decimals: 6,
      symbol: 'some-symbol',
      description: 'some-description',
      fingerprint: 'some-fingerprint',
      group: 'some-group',
      icon: 'some-icon',
      id: '.',
      image: 'some-image',
      kind: 'ft',
      metadatas: {},
      ticker: 'some-ticker',
    },
    status: 'verified',
    price: {
      askPrice: 1.2,
      bidPrice: 1.3,
      baseDecimalPlaces: 6,
      price: 1.4,
      price10d: [1.2, 1.3],
      priceChange: {
        '24h': 1.5,
        '7d': 1.6,
      },
      quoteDecimalPlaces: 6,
      volume: {
        base: 1.7,
        quote: 1.8,
      },
      volumeChange: {
        base: 1.9,
        quote: 2.0,
      },
    },
    supply: {
      circulating: '1.1',
      total: '1.2',
    },
  },
]

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

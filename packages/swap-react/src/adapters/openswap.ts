import {Swap} from '@yoroi/types'
import {makeMockSwapApiClient, makeMockSwapStorage} from './mocks'

const initialDeps = {
  apiClient: makeMockSwapApiClient({
    apiUrl: 'https://127.0.0.1:8080/api',
    stakingKey: 'test',
  }),
  storage: makeMockSwapStorage(),
} as const

export function makeSwapModule(
  {apiUrl, stakingKey}: Readonly<Swap.FactoryOptions>,
  {apiClient, storage} = initialDeps,
) {
  console.log(apiUrl, stakingKey, apiClient, storage)

  const dexModule = () => {} // init something

  const getOpenOrders = () => {
    dexModule()
    return [
      {
        id: '1',
        type: 'limit',
      },
    ]
  }

  const createOrder = (
    orderType: Swap.OrderType,
    order: Swap.CreateOrderData,
  ) => {
    dexModule()
    return {
      orderType,
      order,
    }
  }

  const cancelOrder = (orderType: Swap.OrderType, order: any) => {
    dexModule()
    return {
      orderType,
      order,
    }
  }

  const getSupportedTokens = () => {
    dexModule()
    return {}
  }

  const getTokenPairPools = () => {
    dexModule()
    return {}
  }

  return {
    orders: {
      create: createOrder,
      cancel: cancelOrder,
      list: {
        open: getOpenOrders,
      },
    },
    pairs: {
      list: {
        supportedByToken: getSupportedTokens,
      },
    },
    pools: {
      list: {
        byPair: getTokenPairPools,
      },
    },
  } as const
}

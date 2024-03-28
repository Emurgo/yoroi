import {OpenSwapApi} from './api'
import {axiosClient} from './config'
import {
  CancelOrderRequest,
  CreateOrderRequest,
  Network,
  Provider,
} from './types'

jest.mock('./config.ts')

describe('OpenSwapApi constructor', () => {
  it('should throw an error for unsupported networks', () => {
    const unsupportedNetwork = 'testnet' // Assuming 'testnet' is not supported
    expect(() => new OpenSwapApi(unsupportedNetwork as Network)).toThrow(
      /Supported networks are/,
    )
  })

  it('should create an instance for supported networks', () => {
    const supportedNetwork = 'mainnet'
    const api = new OpenSwapApi(supportedNetwork)
    expect(api).toBeInstanceOf(OpenSwapApi)
    expect(api.network).toBe(supportedNetwork)
  })
})

describe('createOrder', () => {
  it('should call createOrder with correct parameters', async () => {
    const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: 'test-createOrder',
      }),
    )

    const api = new OpenSwapApi('mainnet', axiosClient)
    const orderData: CreateOrderRequest = {
      walletAddress: 'walletAddress',
      protocol: 'sundaeswap',
      poolId: 'poolId',
      sell: {
        policyId: 'sell-policyId',
        assetName: 'buy-assetName',
        amount: '123',
      },
      buy: {
        policyId: 'buy-policyId',
        assetName: 'buy-assetName',
        amount: '321',
      },
    }

    const result = await api.createOrder(orderData)

    expect(result).toBe('test-createOrder')
  })
})

describe('cancelOrder', () => {
  it('should call cancelOrder with correct parameters', async () => {
    const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: {cbor: 'test-cancelOrder'},
      }),
    )

    const api = new OpenSwapApi('mainnet', axiosClient)
    const orderData: CancelOrderRequest = {
      orderUTxO: 'orderUTxO',
      collateralUTxO: 'collateralUTxO',
      walletAddress: 'walletAddress',
    }

    const result = await api.cancelOrder(orderData)

    expect(result).toBe('test-cancelOrder')
  })
})

describe('getOrders', () => {
  it('should call getOrders with correct parameters', async () => {
    const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: 'test-getOrders',
      }),
    )

    const api = new OpenSwapApi('mainnet', axiosClient)
    const stakeKeyHash = 'stake-key-hash'

    const result = await api.getOrders(stakeKeyHash)

    expect(result).toBe('test-getOrders')
  })
})

describe('getCompletedOrders', () => {
  it('should call getCompletedOrders with correct parameters', async () => {
    const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: [{status: 'matched', test: 'test-getCompletedOrders'}],
      }),
    )

    const api = new OpenSwapApi('mainnet', axiosClient)
    const stakeKeyHash = 'stake-key-hash'

    const result = await api.getCompletedOrders(stakeKeyHash)

    expect(result).toEqual([
      {status: 'matched', test: 'test-getCompletedOrders'},
    ])
  })
})

describe('getPrice', () => {
  it('should call getPrice with correct parameters', async () => {
    const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: 'test-getPrice',
      }),
    )

    const api = new OpenSwapApi('mainnet', axiosClient)
    const baseToken = {
      policyId: 'baseToken-policyId',
      name: 'baseToken-name',
    }
    const quoteToken = {
      policyId: 'quoteToken-policyId',
      name: 'quoteToken-name',
    }

    const result = await api.getPrice({baseToken, quoteToken})

    expect(result).toEqual('test-getPrice')
  })
})

describe('getPoolsPair', () => {
  it('should call getPoolsPair with correct parameters', async () => {
    const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: 'test-getPoolsPair',
      }),
    )

    const api = new OpenSwapApi('mainnet', axiosClient)
    const tokenA = {
      policyId: 'tokenA-policyId',
      assetName: 'tokenA-name',
    }
    const tokenB = {
      policyId: 'tokenB-policyId',
      assetName: 'tokenB-name',
    }

    const result = await api.getPoolsPair({tokenA, tokenB})

    expect(result).toEqual('test-getPoolsPair')
  })
})

describe('getLiquidityPools', () => {
  it('should call getLiquidityPools with correct parameters', async () => {
    const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: 'test-getLiquidityPools',
      }),
    )

    const api = new OpenSwapApi('mainnet', axiosClient)
    const tokenA = 'tokenA'
    const tokenB = 'tokenB'
    const providers: ReadonlyArray<Provider> = ['spectrum']

    const result = await api.getLiquidityPools({tokenA, tokenB, providers})

    expect(result).toEqual('test-getLiquidityPools')
  })
})

describe('getTokenPairs', () => {
  it('should call getTokenPairs with correct parameters', async () => {
    const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: 'test-getTokenPairs',
      }),
    )

    const api = new OpenSwapApi('mainnet', axiosClient)

    const result = await api.getTokenPairs()

    expect(result).toEqual('test-getTokenPairs')
  })
})

describe('getTokens', () => {
  it('should call getTokens with correct parameters', async () => {
    const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: 'test-getTokens',
      }),
    )

    const api = new OpenSwapApi('mainnet', axiosClient)

    const result = await api.getTokens()

    expect(result).toEqual('test-getTokens')
  })
})

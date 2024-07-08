import {Portfolio, Swap} from '@yoroi/types'

import {swapApiMaker} from './api-maker'
import {openswapMocks} from './openswap-api/openswap.mocks'
import {apiMocks} from './openswap-api/api.mocks'
import {OpenSwapApi} from './openswap-api/api'
import {tokenInfoMocks} from '@yoroi/portfolio'

const stakingKey = 'someStakingKey'
const primaryTokenInfo = tokenInfoMocks.primaryETH
const supportedProviders: ReadonlyArray<Swap.SupportedProvider> = ['minswap']

describe('swapApiMaker', () => {
  let mockOpenSwapApi: jest.Mocked<OpenSwapApi>

  beforeEach(() => {
    jest.clearAllMocks()
    mockOpenSwapApi = {
      getPrice: jest.fn(),
      cancelOrder: jest.fn(),
      createOrder: jest.fn(),
      getOrders: jest.fn(),
      getTokens: jest.fn(),
      getTokenPairs: jest.fn(),
      getCompletedOrders: jest.fn(),
      getLiquidityPools: jest.fn(),
      getPoolsPair: jest.fn(),
      network: 'mainnet',
    } as any
  })

  it('getOpenOrders', async () => {
    mockOpenSwapApi.getOrders = jest
      .fn()
      .mockResolvedValue(openswapMocks.getOpenOrders)

    const api = swapApiMaker(
      {
        isMainnet: true,
        stakingKey,
        primaryTokenInfo,
        supportedProviders,
      },
      {
        openswap: mockOpenSwapApi,
      },
    )

    const result = await api.getOpenOrders()

    expect(mockOpenSwapApi.getOrders).toBeCalledWith(stakingKey)
    expect(result).toEqual<Swap.OpenOrderResponse>(apiMocks.getOpenOrders)
  })

  it('getCompletedOrders', async () => {
    mockOpenSwapApi.getCompletedOrders = jest
      .fn()
      .mockResolvedValue(openswapMocks.getCompletedOrders)

    const api = swapApiMaker(
      {
        isMainnet: true,
        stakingKey,
        primaryTokenInfo,
        supportedProviders,
      },
      {
        openswap: mockOpenSwapApi,
      },
    )

    const result = await api.getCompletedOrders()

    expect(mockOpenSwapApi.getCompletedOrders).toBeCalledWith(stakingKey)
    expect(result).toEqual<Swap.CompletedOrderResponse>(
      apiMocks.getCompletedOrders,
    )
  })

  it('cancelOrder', async () => {
    mockOpenSwapApi = {
      cancelOrder: jest.fn().mockResolvedValue('data'),
    } as any

    const api = swapApiMaker(
      {
        isMainnet: true,
        stakingKey,
        primaryTokenInfo,
        supportedProviders,
      },
      {
        openswap: mockOpenSwapApi,
      },
    )

    const result = await api.cancelOrder({
      address: 'address',
      utxos: {
        order: 'order',
        collateral: 'collateral',
      },
    })

    expect(mockOpenSwapApi.cancelOrder).toBeCalledWith({
      collateralUTxO: 'collateral',
      orderUTxO: 'order',
      walletAddress: 'address',
    })
    expect(result).toBe('data')
  })

  it('no deps (coverage)', () => {
    const testnet = swapApiMaker({
      isMainnet: true,
      stakingKey,
      primaryTokenInfo,
      supportedProviders,
    })
    expect(testnet).toBeDefined()

    const mainnet = swapApiMaker({
      isMainnet: false,
      stakingKey,
      primaryTokenInfo,
      supportedProviders,
    })
    expect(mainnet).toBeDefined()
  })

  describe('createOrder', () => {
    it('success', async () => {
      const mockApiResponse = {
        status: 'success',
        datum: 'someDatum',
        hash: 'someHash',
        address: 'someContractAddress',
      }

      mockOpenSwapApi.createOrder = jest.fn().mockResolvedValue(mockApiResponse)

      const api = swapApiMaker(
        {
          isMainnet: true,
          stakingKey,
          primaryTokenInfo,
          supportedProviders,
        },
        {
          openswap: mockOpenSwapApi,
        },
      )

      const result = await api.createOrder(apiMocks.createOrderData)

      expect(mockOpenSwapApi.createOrder).toHaveBeenCalledWith(
        expect.any(Object),
      )
      expect(result).toEqual<Swap.CreateOrderResponse>({
        datum: mockApiResponse.datum,
        datumHash: mockApiResponse.hash,
        contractAddress: mockApiResponse.address,
      })
    })

    it('fail with reason', async () => {
      const mockApiResponse = {
        status: 'failed',
        reason: 'Insufficient funds',
      }

      mockOpenSwapApi.createOrder = jest.fn().mockResolvedValue(mockApiResponse)

      const api = swapApiMaker(
        {
          isMainnet: true,
          stakingKey,
          primaryTokenInfo,
          supportedProviders,
        },
        {
          openswap: mockOpenSwapApi,
        },
      )

      await expect(api.createOrder(apiMocks.createOrderData)).rejects.toBe(
        'Insufficient funds',
      )
      expect(mockOpenSwapApi.createOrder).toHaveBeenCalledWith(
        expect.any(Object),
      )
    })

    it('fail with no reason', async () => {
      const mockApiResponse = {
        status: 'failed',
      }

      mockOpenSwapApi.createOrder = jest.fn().mockResolvedValue(mockApiResponse)

      const api = swapApiMaker(
        {
          isMainnet: true,
          stakingKey,
          primaryTokenInfo,
          supportedProviders,
        },
        {
          openswap: mockOpenSwapApi,
        },
      )

      await expect(api.createOrder(apiMocks.createOrderData)).rejects.toBe(
        'Unknown error',
      )
      expect(mockOpenSwapApi.createOrder).toHaveBeenCalledWith(
        expect.any(Object),
      )
    })
  })

  describe('getTokenPairs', () => {
    it('mainnet', async () => {
      mockOpenSwapApi.getTokenPairs = jest
        .fn()
        .mockResolvedValue(openswapMocks.getTokenPairs)
      const api = swapApiMaker(
        {
          isMainnet: true,
          stakingKey,
          primaryTokenInfo,
          supportedProviders,
        },
        {
          openswap: mockOpenSwapApi,
        },
      )

      const result = await api.getTokenPairs('.')

      expect(mockOpenSwapApi.getTokenPairs).toHaveBeenCalledTimes(1)
      expect(result).toEqual<Array<Portfolio.Token.Info>>(
        apiMocks.getTokenPairs,
      )
    })

    it('preprod (mocked)', async () => {
      mockOpenSwapApi.getTokenPairs = jest
        .fn()
        .mockResolvedValue(openswapMocks.getTokenPairs)

      const api = swapApiMaker(
        {
          isMainnet: false,
          stakingKey,
          primaryTokenInfo,
          supportedProviders,
        },
        {
          openswap: mockOpenSwapApi,
        },
      )

      const result = await api.getTokenPairs('.')

      expect(result).toBeDefined()
      expect(mockOpenSwapApi.getTokenPairs).not.toHaveBeenCalled()
    })
  })

  describe('getTokens', () => {
    it('mainnet', async () => {
      mockOpenSwapApi.getTokens = jest
        .fn()
        .mockResolvedValue(openswapMocks.getTokens)
      const api = swapApiMaker(
        {
          isMainnet: true,
          stakingKey,
          primaryTokenInfo,
          supportedProviders,
        },
        {
          openswap: mockOpenSwapApi,
        },
      )

      const result = await api.getTokens()

      expect(mockOpenSwapApi.getTokens).toHaveBeenCalledTimes(1)
      expect(result).toEqual<Array<Portfolio.Token.Info>>(apiMocks.getTokens)
    })

    it('preprod', async () => {
      mockOpenSwapApi.getTokens = jest
        .fn()
        .mockResolvedValue(openswapMocks.getTokens)

      const api = swapApiMaker(
        {
          isMainnet: false,
          stakingKey,
          primaryTokenInfo,
          supportedProviders,
        },
        {
          openswap: mockOpenSwapApi,
        },
      )

      const result = await api.getTokens()

      expect(result).toBeDefined()
      expect(mockOpenSwapApi.getTokenPairs).not.toHaveBeenCalled()
    })
  })

  describe('getPools', () => {
    it('mainnet', async () => {
      mockOpenSwapApi.getLiquidityPools = jest
        .fn()
        .mockResolvedValue(openswapMocks.getLiquidityPools)

      const api = swapApiMaker(
        {
          isMainnet: true,
          stakingKey,
          primaryTokenInfo,
          supportedProviders,
        },
        {
          openswap: mockOpenSwapApi,
        },
      )

      const result = await api.getPools({
        tokenA: 'token.A',
        tokenB: 'token.B',
      })

      expect(result).toEqual<Swap.PoolResponse>(apiMocks.getPools)
      expect(mockOpenSwapApi.getLiquidityPools).toHaveBeenCalledTimes(1)
    })

    it('preprod (mocked)', async () => {
      mockOpenSwapApi.getLiquidityPools = jest
        .fn()
        .mockResolvedValue(openswapMocks.getLiquidityPools)

      const api = swapApiMaker(
        {
          isMainnet: false,
          stakingKey,
          primaryTokenInfo,
          supportedProviders,
        },
        {
          openswap: mockOpenSwapApi,
        },
      )

      const result = await api.getPools({
        tokenA: 'token.A',
        tokenB: 'token.B',
      })

      expect(result).toBeDefined()
      expect(mockOpenSwapApi.getLiquidityPools).not.toHaveBeenCalled()
    })
  })

  describe('getPrice', () => {
    it('mainnet', async () => {
      mockOpenSwapApi.getPrice = jest
        .fn()
        .mockResolvedValue(openswapMocks.getPrice)

      const api = swapApiMaker(
        {
          isMainnet: true,
          stakingKey,
          primaryTokenInfo,
          supportedProviders,
        },
        {
          openswap: mockOpenSwapApi,
        },
      )

      const result = await api.getPrice({
        baseToken: '.',
        quoteToken:
          '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e',
      })

      expect(result).toBe(0.07080044463)
      expect(mockOpenSwapApi.getPrice).toHaveBeenCalledTimes(1)
    })
  })
})

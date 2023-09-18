import {OpenSwapApi} from '@yoroi/openswap'
import {Portfolio, Swap} from '@yoroi/types'

import {swapApiMaker} from './api'
import {openswapMocks} from './openswap.mocks'
import {apiMocks} from './api.mocks'

const stakingKey = 'someStakingKey'
const primaryTokenId = ''

describe('swapApiMaker', () => {
  let mockOpenSwapApi: jest.Mocked<OpenSwapApi>

  beforeEach(() => {
    jest.clearAllMocks()
    mockOpenSwapApi = {
      cancelOrder: jest.fn(),
      createOrder: jest.fn(),
      getOrders: jest.fn(),
      getTokens: jest.fn(),
      getCompletedOrders: jest.fn(),
      getPools: jest.fn(),
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
        primaryTokenId,
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
        primaryTokenId,
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
        primaryTokenId,
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
      primaryTokenId,
    })
    expect(testnet).toBeDefined()

    const mainnet = swapApiMaker({
      isMainnet: false,
      stakingKey,
      primaryTokenId,
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
          primaryTokenId,
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
          primaryTokenId,
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
          primaryTokenId,
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

  describe('getTokens', () => {
    it('mainnet', async () => {
      mockOpenSwapApi.getTokens = jest
        .fn()
        .mockResolvedValue(openswapMocks.getTokens)
      const api = swapApiMaker(
        {
          isMainnet: true,
          stakingKey,
          primaryTokenId,
        },
        {
          openswap: mockOpenSwapApi,
        },
      )

      const result = await api.getTokens('')

      expect(mockOpenSwapApi.getTokens).toHaveBeenCalledTimes(1)
      expect(result).toEqual<Array<Portfolio.Token>>(apiMocks.getTokens)
    })

    it('preprod (mocked)', async () => {
      mockOpenSwapApi.getTokens = jest
        .fn()
        .mockResolvedValue(openswapMocks.getTokens)

      const api = swapApiMaker(
        {
          isMainnet: false,
          stakingKey,
          primaryTokenId,
        },
        {
          openswap: mockOpenSwapApi,
        },
      )

      const result = await api.getTokens('')

      expect(result).toBeDefined()
      expect(mockOpenSwapApi.getTokens).not.toHaveBeenCalled()
    })
  })

  describe('getPools', () => {
    it('mainnet', async () => {
      mockOpenSwapApi.getPools = jest
        .fn()
        .mockResolvedValue(openswapMocks.getPools)

      const api = swapApiMaker(
        {
          isMainnet: true,
          stakingKey,
          primaryTokenId,
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
      expect(mockOpenSwapApi.getPools).toHaveBeenCalledTimes(1)
    })

    it('preprod (mocked)', async () => {
      mockOpenSwapApi.getPools = jest
        .fn()
        .mockResolvedValue(openswapMocks.getPools)

      const api = swapApiMaker(
        {
          isMainnet: false,
          stakingKey,
          primaryTokenId,
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
      expect(mockOpenSwapApi.getPools).not.toHaveBeenCalled()
    })
  })
})

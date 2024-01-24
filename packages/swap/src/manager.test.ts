import {Swap} from '@yoroi/types'
import {swapManagerMaker} from './manager'
import {swapManagerMocks} from './manager.mocks'

describe('swapManagerMaker', () => {
  let manager: Readonly<Swap.Manager>

  const mockedStorage: Swap.Storage = {
    slippage: {
      read: jest.fn().mockResolvedValue(swapManagerMocks.slippageResponse),
      remove: jest.fn(),
      save: jest.fn(),
      key: 'mock-swap-slippage',
    },
    clear: jest.fn().mockResolvedValue(undefined),
  }

  const mockedApi = {
    cancelOrder: jest.fn(),
    createOrder: jest.fn(),
    getOpenOrders: jest.fn(),
    getPrice: jest.fn(),
    getPools: jest.fn(),
    getTokens: jest.fn(),
    getTokenPairs: jest.fn(),
    getCompletedOrders: jest.fn(),
    primaryTokenId: '',
    stakingKey: 'someStakingKey',
    supportedProviders: ['minswap'] as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    manager = swapManagerMaker({
      swapStorage: mockedStorage,
      swapApi: mockedApi,
      aggregator: 'muesliswap',
      aggregatorTokenId: '',
      frontendFeeTiers: [] as const,
    })
  })

  it('clearStorage clear', async () => {
    await expect(manager.clearStorage()).resolves.toBeUndefined()
    expect(mockedStorage.clear).toHaveBeenCalledTimes(1)
  })

  it('slippage', async () => {
    await expect(manager.slippage.read()).resolves.toBe(
      swapManagerMocks.slippageResponse,
    )
  })

  it('orders (create, cancel, getOpen, getCompleted)', async () => {
    await manager.order.cancel({} as any)
    expect(mockedApi.cancelOrder).toHaveBeenCalledTimes(1)

    await manager.order.create({} as any)
    expect(mockedApi.createOrder).toHaveBeenCalledTimes(1)

    await manager.order.list.byStatusOpen()
    expect(mockedApi.getOpenOrders).toHaveBeenCalledTimes(1)

    await manager.order.list.byStatusCompleted()
    expect(mockedApi.getCompletedOrders).toHaveBeenCalledTimes(1)
  })
})

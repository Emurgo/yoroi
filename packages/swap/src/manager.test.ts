import {Chain, Swap, Api} from '@yoroi/types'

import {swapManagerMaker} from './manager'
import {dexhunterApiMaker} from './adapters/api/dexhunter/api-maker'
import {muesliswapApiMaker} from './adapters/api/muesliswap/api-maker'

jest.mock('./adapters/api/dexhunter/api-maker', () => ({
  dexhunterApiMaker: jest.fn(),
}))
jest.mock('./adapters/api/muesliswap/api-maker', () => ({
  muesliswapApiMaker: jest.fn(),
}))

import {
  api as dhApiMocks,
  primaryTokenInfo,
} from './adapters/api/dexhunter/api.mocks'
import {api as msApiMocks} from './adapters/api/muesliswap/api.mocks'

describe('swapManagerMaker', () => {
  let mockDexhunterApi: jest.Mocked<Swap.Api>
  let mockMuesliswapApi: jest.Mocked<Swap.Api>

  const baseConfig = {
    address: 'someAddress',
    addressHex: 'someAddressHex',
    network: 'mainnet' as Chain.SupportedNetworks,
    primaryTokenInfo,
    isPrimaryToken: () => false,
    stakingKey: 'someStakingKey',
    storage: {
      clear: jest.fn(),
      slippage: jest.fn(() => 0.5),
    },
  } as any

  beforeEach(() => {
    jest.clearAllMocks()

    mockDexhunterApi = {
      tokens: jest.fn(),
      orders: jest.fn(),
      protocols: jest.fn(),
      estimate: jest.fn(),
      create: jest.fn(),
      cancel: jest.fn(),
    } as any

    mockMuesliswapApi = {
      tokens: jest.fn(),
      orders: jest.fn(),
      protocols: jest.fn(),
      estimate: jest.fn(),
      create: jest.fn(),
      cancel: jest.fn(),
    } as any

    mockDexhunterApi.tokens.mockResolvedValue({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: dhApiMocks.results.tokens,
      },
    })
    mockMuesliswapApi.tokens.mockResolvedValue({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: msApiMocks.results.tokens,
      },
    })
    ;(dexhunterApiMaker as jest.Mock).mockReturnValue(mockDexhunterApi)
    ;(muesliswapApiMaker as jest.Mock).mockReturnValue(mockMuesliswapApi)
  })

  it('creates a manager with an API proxy', () => {
    const manager = swapManagerMaker(baseConfig)
    expect(manager).toHaveProperty('api')
    expect(manager).toHaveProperty('assignConfig')
    expect(manager).toHaveProperty('config')
    expect(manager).toHaveProperty('clearStorage')
    expect(manager).toHaveProperty('slippage')
  })

  it('defaults to routingPreference: ["dexhunter", "muesliswap"]', () => {
    const manager = swapManagerMaker(baseConfig)
    expect(manager.config.routingPreference).toBe(['dexhunter', 'muesliswap'])
  })

  describe('tokens()', () => {
    it('merges both aggregator tokens if both are right', async () => {
      const manager = swapManagerMaker(baseConfig)

      const result = await manager.api.tokens()
      expect(result.tag).toBe('right')
      if (result.tag === 'right') {
        expect(result.value.data).toEqual(
          expect.arrayContaining([
            ...dhApiMocks.results.tokens,
            ...msApiMocks.results.tokens,
          ]),
        )
      }
    })

    it('returns left if both are left', async () => {
      mockDexhunterApi.tokens.mockResolvedValue({
        tag: 'left',
        error: {status: 500, message: 'dh tokens error', responseData: {}},
      })
      mockMuesliswapApi.tokens.mockResolvedValue({
        tag: 'left',
        error: {status: 500, message: 'ms tokens error', responseData: {}},
      })

      const manager = swapManagerMaker(baseConfig)
      const result = await manager.api.tokens()
      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toBe('ms tokens error')
    })

    it('returns the right aggregator if the other aggregator is left', async () => {
      mockDexhunterApi.tokens.mockResolvedValue({
        tag: 'left',
        error: {status: 500, message: 'dh error', responseData: {}},
      })

      const manager = swapManagerMaker(baseConfig)
      const result = await manager.api.tokens()
      expect(result.tag).toBe('right')
      expect(mockMuesliswapApi.tokens).toHaveBeenCalled()
    })
  })

  describe('orders()', () => {
    it('merges both aggregator orders when both are right', async () => {
      mockDexhunterApi.orders.mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: dhApiMocks.results.orders,
        },
      })
      mockMuesliswapApi.orders.mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: msApiMocks.results.orders,
        },
      })

      const manager = swapManagerMaker(baseConfig)
      const result = await manager.api.orders()
      expect(result.tag).toBe('right')
      if (result.tag === 'right') {
        expect(result.value.data).toEqual(
          expect.arrayContaining([
            ...dhApiMocks.results.orders,
            ...msApiMocks.results.orders,
          ]),
        )
      }
    })

    it('returns left if both are left', async () => {
      mockDexhunterApi.orders.mockResolvedValue({
        tag: 'left',
        error: {status: 400, message: 'dh orders error', responseData: {}},
      })
      mockMuesliswapApi.orders.mockResolvedValue({
        tag: 'left',
        error: {status: 400, message: 'ms orders error', responseData: {}},
      })

      const manager = swapManagerMaker(baseConfig)
      const result = await manager.api.orders()
      expect(result.tag).toBe('left')
    })
  })

  describe('estimate()', () => {
    it('if aggregatorSelected is not auto, calls only that aggregator', async () => {
      const manager = swapManagerMaker(baseConfig)
      // set aggregatorSelected to 'muesliswap'
      manager.assignConfig({routingPreference: ['muesliswap']})

      await manager.api.estimate(msApiMocks.inputs.quote)
      expect(mockMuesliswapApi.estimate).toHaveBeenCalledWith(
        msApiMocks.inputs.quote,
      )
      expect(mockDexhunterApi.estimate).not.toHaveBeenCalled()
    })

    it('merges results and picks the best swap if aggregatorSelected=auto', async () => {
      mockDexhunterApi.estimate.mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: dhApiMocks.results.estimate,
        },
      })
      mockMuesliswapApi.estimate.mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: msApiMocks.results.quote,
        },
      })

      const manager = swapManagerMaker(baseConfig)
      await manager.api.estimate(dhApiMocks.inputs.estimate)
      // TODO: need to add tokens - maybe should not check all the time for it
      // expect(result.tag).toBe('right')
      // expect(result.value.data).toEqual(api.responses.dexhunterEstimate)
    })
  })

  describe('cancel()', () => {
    it('delegates to the aggregator specified in the order', async () => {
      const manager = swapManagerMaker(baseConfig)
      await manager.api.cancel(dhApiMocks.inputs.cancel)
      expect(mockMuesliswapApi.cancel).toHaveBeenCalled()
      expect(mockDexhunterApi.cancel).not.toHaveBeenCalled()
    })
  })
})

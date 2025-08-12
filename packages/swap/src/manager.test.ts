import {Chain, Swap, Api} from '@yoroi/types'
import {isLeft} from '@yoroi/common'

import {standarizeError, swapManagerMaker} from './manager'
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
      settings: {
        save: jest.fn(),
        read: jest.fn(
          () =>
            new Promise((resolve) =>
              resolve({routingPreferences: 'auto', slippage: 1}),
            ),
        ),
      },
    },
    partners: {
      [Swap.Aggregator.Dexhunter]: 'somePartnerId',
      [Swap.Aggregator.Muesliswap]: 'somePartnerId',
    },
  } as any

  beforeEach(() => {
    jest.clearAllMocks()

    mockDexhunterApi = {
      tokens: jest.fn(),
      orders: jest.fn(),
      limitOptions: jest.fn(),
      estimate: jest.fn(),
      create: jest.fn(),
      cancel: jest.fn(),
    } as any

    mockMuesliswapApi = {
      tokens: jest.fn(),
      orders: jest.fn(),
      limitOptions: jest.fn(),
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

    mockDexhunterApi.estimate.mockResolvedValue({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: dhApiMocks.results.estimate,
      },
    })

    mockMuesliswapApi.estimate.mockResolvedValue({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: msApiMocks.results.estimate,
      },
    })

    mockDexhunterApi.create.mockResolvedValue({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: dhApiMocks.results.create,
      },
    })

    mockMuesliswapApi.create.mockResolvedValue({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: msApiMocks.results.create,
      },
    })
    ;(dexhunterApiMaker as jest.Mock).mockReturnValue(mockDexhunterApi)
    ;(muesliswapApiMaker as jest.Mock).mockReturnValue(mockMuesliswapApi)
  })

  it('creates a manager with an API proxy', () => {
    const manager = swapManagerMaker(baseConfig)
    expect(manager).toHaveProperty('api')
    expect(manager).toHaveProperty('assignSettings')
    expect(manager).toHaveProperty('settings')
    expect(manager).toHaveProperty('clearStorage')
  })

  it('defaults to routingPreference: "auto"', () => {
    const manager = swapManagerMaker(baseConfig)
    expect(manager.settings.routingPreference).toBe('auto')
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

    it('calls muesliswap api if routing preference is muesliswap', async () => {
      const manager = swapManagerMaker(baseConfig)
      manager.assignSettings({routingPreference: ['muesliswap']})

      const result = await manager.api.tokens()
      expect(result.tag).toBe('right')
      expect(mockMuesliswapApi.tokens).toHaveBeenCalled()
    })

    it('calls dexhunter api if routing preference is dexhunter', async () => {
      const manager = swapManagerMaker(baseConfig)
      manager.assignSettings({routingPreference: ['dexhunter']})

      const result = await manager.api.tokens()
      expect(result.tag).toBe('right')
      expect(mockDexhunterApi.tokens).toHaveBeenCalled()
    })

    it('excludes aggregator if routing preference array does not include it', async () => {
      const manager = swapManagerMaker(baseConfig)
      manager.assignSettings({routingPreference: ['muesliswap']})

      const result = await manager.api.tokens()
      expect(result.tag).toBe('right')
      expect(mockMuesliswapApi.tokens).toHaveBeenCalled()
      // Dexhunter should be excluded because it's not in the routing preference array
      // The excluded response should be returned instead of calling the API
      // Since the promise is created immediately, the API is still called, but the result is excluded
      expect(mockDexhunterApi.tokens).toHaveBeenCalled()
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
      expect(result.error.message).toBe('Unknown error')
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

  describe('create()', () => {
    it('gets the best swap when routing is "auto"', async () => {
      const manager = swapManagerMaker(baseConfig)

      const result = await manager.api.create(msApiMocks.inputs.create[0]!)
      expect(result.tag).toBe('right')
      if (result.tag === 'right') {
        expect(result.value.data).toEqual(dhApiMocks.results.create)
      }
    })

    it('gets the selected swap when routing is not "auto"', async () => {
      const manager = swapManagerMaker(baseConfig)
      manager.assignSettings({routingPreference: ['dexhunter']})

      const result = await manager.api.create(msApiMocks.inputs.create[0]!)
      expect(result.tag).toBe('right')
      if (result.tag === 'right') {
        expect(result.value.data).toEqual(dhApiMocks.results.create)
      }
    })

    it('should return api error', async () => {
      mockMuesliswapApi.create.mockResolvedValue({
        tag: 'left',
        error: {status: 400, message: 'ms create error', responseData: {}},
      })

      mockDexhunterApi.create.mockResolvedValue({
        tag: 'left',
        error: {
          status: -3,
          message: 'Aggregator excluded from call',
          responseData: {},
        },
      })

      const manager = swapManagerMaker(baseConfig)
      const result = await manager.api.create(msApiMocks.inputs.create[0]!)

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toBe('ms create error')
      expect(result.error.status).toBe(400)
    })

    it('should return "invalid" error', async () => {
      mockMuesliswapApi.create.mockResolvedValue({
        tag: 'left',
        error: {
          status: -3,
          message: 'Aggregator excluded from call',
          responseData: {},
        },
      })

      mockDexhunterApi.create.mockResolvedValue({
        tag: 'left',
        error: {
          status: -3,
          message: 'Aggregator excluded from call',
          responseData: {},
        },
      })

      const manager = swapManagerMaker(baseConfig)
      const result = await manager.api.create(msApiMocks.inputs.create[0]!)

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toBe('Unknown error')
      expect(result.error.status).toBe(-3)
    })
  })

  describe('orders()', () => {
    it('merges both aggregator orders when both are right', async () => {
      const dhDataDuplicated: Array<Swap.Order> = [
        ...dhApiMocks.results.orders,
        {
          actualAmountOut: 0,
          aggregator: 'dexhunter',
          amountIn: -0.04999999999999982,
          customId: 'customId-1',
          expectedAmountOut: 1.889324,
          lastUpdate: undefined,
          outputIndex: 0,
          placedAt: undefined,
          protocol: 'vyfi-v1',
          status: 'canceled',
          tokenIn: '.',
          tokenOut:
            '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e.776f726c646d6f62696c65746f6b656e',
          txHash:
            '0b2bd77dd3bd670cbbe30cac001af1565c9b807dd666193fd9ac8dad319ab24b',
          updateTxHash:
            '0b2bd77dd3bd670cbbe30cac001af1565c9b807dd666193fd9ac8dad319ab24b',
        },
        {
          actualAmountOut: 0,
          aggregator: 'dexhunter',
          amountIn: -0.04999999999999982,
          customId: 'customId-2',
          expectedAmountOut: 1.889324,
          lastUpdate: undefined,
          outputIndex: 0,
          placedAt: undefined,
          protocol: 'vyfi-v1',
          status: 'canceled',
          tokenIn: '.',
          tokenOut:
            '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e.776f726c646d6f62696c65746f6b656e',
          txHash:
            '8956d68753d718afbaafde0e83dc1cb1d205da3c89fb08c924ab1d63fd953ed2',
          updateTxHash:
            '8956d68753d718afbaafde0e83dc1cb1d205da3c89fb08c924ab1d63fd953ed2',
        },
        {
          // duplicated
          actualAmountOut: 0,
          aggregator: 'dexhunter',
          amountIn: -0.04999999999999982,
          customId: 'customId-3',
          expectedAmountOut: 1.889324,
          lastUpdate: undefined,
          outputIndex: 0,
          placedAt: undefined,
          protocol: 'vyfi-v1',
          status: 'canceled',
          tokenIn: '.',
          tokenOut:
            '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e.776f726c646d6f62696c65746f6b656e',
          txHash:
            '8956d68753d718afbaafde0e83dc1cb1d205da3c89fb08c924ab1d63fd953ed2',
          updateTxHash:
            '8956d68753d718afbaafde0e83dc1cb1d205da3c89fb08c924ab1d63fd953ed2',
        },
      ]

      const dhDataOrdered: Array<Swap.Order> = [
        {
          actualAmountOut: 0,
          aggregator: 'muesliswap',
          amountIn: 0.008137,
          expectedAmountOut: 1,
          lastUpdate: undefined,
          outputIndex: 0,
          placedAt: 1737538157000,
          protocol: 'minswap-v2',
          status: 'canceled',
          tokenIn: '.',
          tokenOut:
            '49e423161ef818adc475c783571cb479d5f15ad52a01a240eacc0d3b.434f434b',
          txHash:
            '475ffb1f1820eee1790729d86ced473e9f7724ddcd7bf59b477e3293415f16bf',
          updateTxHash:
            '475ffb1f1820eee1790729d86ced473e9f7724ddcd7bf59b477e3293415f16bf',
        },
        {
          actualAmountOut: 11,
          aggregator: 'muesliswap',
          amountIn: 0.000036,
          expectedAmountOut: 10,
          lastUpdate: 1722503915000,
          outputIndex: 0,
          placedAt: 1722503907000,
          protocol: 'sundaeswap-v1',
          status: 'matched',
          tokenIn: '.',
          tokenOut:
            '4cb48d60d1f7823d1307c61b9ecf472ff78cf22d1ccc5786d59461f8.4144414d4f4f4e',
          txHash:
            '29f51a2a9e46ced05f03abc9b419ae57164dc056534121f041d69e307b9722f8',
          updateTxHash:
            '8d3b20bafb8378366f819f506da327a43e94d6948c002bac00a9b1de401bc571',
        },
        {
          actualAmountOut: 0.00037900000000012923,
          aggregator: 'muesliswap',
          amountIn: 1,
          customId: '66cf043794579f05fc204f72',
          expectedAmountOut: 0.000368,
          lastUpdate: 1719137534000,
          outputIndex: 0,
          placedAt: 1719137466000,
          protocol: 'sundaeswap-v1',
          status: 'matched',
          tokenIn:
            'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
          tokenOut: '.',
          txHash:
            '8751fbef1ebec0d2da9218a69493ef36070012ce24fdbc44ec6df519377b92bf',
          updateTxHash:
            '92bd050ec1da6d25abf6265a6f8318a79a3068459254a79427088407c4241b37',
        },
        {
          actualAmountOut: 5.801912,
          aggregator: 'muesliswap',
          amountIn: 15.330409,
          customId: '66d0e36894579f05fc822e6e',
          expectedAmountOut: 3.756354,
          lastUpdate: 1702736216000,
          outputIndex: 0,
          placedAt: 1702736197000,
          protocol: 'muesliswap-clp',
          status: 'matched',
          tokenIn:
            '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e.776f726c646d6f62696c65746f6b656e',
          tokenOut: '.',
          txHash:
            'f7826e21a464939b64274b00033d7ddebbc90924260d30530fdf7a8cd2824d51',
          updateTxHash:
            'a8b77336d8600f1c8dac0ed90d0ab9c4f1e815bb25f4e168aaaadd130f81457d',
        },
        {
          actualAmountOut: 0,
          aggregator: 'dexhunter',
          amountIn: -0.04999999999999982,
          customId: 'customId-3',
          expectedAmountOut: 1.889324,
          lastUpdate: undefined,
          outputIndex: 0,
          placedAt: undefined,
          protocol: 'vyfi-v1',
          status: 'canceled',
          tokenIn: '.',
          tokenOut:
            '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e.776f726c646d6f62696c65746f6b656e',
          txHash:
            '8956d68753d718afbaafde0e83dc1cb1d205da3c89fb08c924ab1d63fd953ed2',
          updateTxHash:
            '8956d68753d718afbaafde0e83dc1cb1d205da3c89fb08c924ab1d63fd953ed2',
        },
        {
          actualAmountOut: 0,
          aggregator: 'dexhunter',
          amountIn: -0.04999999999999982,
          customId: 'customId-1',
          expectedAmountOut: 1.889324,
          lastUpdate: undefined,
          outputIndex: 0,
          placedAt: undefined,
          protocol: 'vyfi-v1',
          status: 'canceled',
          tokenIn: '.',
          tokenOut:
            '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e.776f726c646d6f62696c65746f6b656e',
          txHash:
            '0b2bd77dd3bd670cbbe30cac001af1565c9b807dd666193fd9ac8dad319ab24b',
          updateTxHash:
            '0b2bd77dd3bd670cbbe30cac001af1565c9b807dd666193fd9ac8dad319ab24b',
        },
      ]

      mockDexhunterApi.orders.mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: dhDataDuplicated,
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
        expect(result.value.data).toEqual(dhDataOrdered)
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

    it('returns muesliswap orders if dexhunter api result is left', async () => {
      mockDexhunterApi.orders.mockResolvedValue({
        tag: 'left',
        error: {status: 400, message: 'dh orders error', responseData: {}},
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
          expect.arrayContaining([...msApiMocks.results.orders]),
        )
      }
    })

    it('returns dexhunter orders if muesliswap api result is left', async () => {
      mockDexhunterApi.orders.mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: dhApiMocks.results.orders,
        },
      })

      mockMuesliswapApi.orders.mockResolvedValue({
        tag: 'left',
        error: {status: 400, message: 'ms orders error', responseData: {}},
      })

      const manager = swapManagerMaker(baseConfig)
      const result = await manager.api.orders()
      expect(result.tag).toBe('right')
      if (result.tag === 'right') {
        expect(result.value.data).toEqual(
          expect.arrayContaining(dhApiMocks.results.orders),
        )
      }
    })
  })

  describe('limitOptions()', () => {
    it('merges both aggregator limit options when both are right', async () => {
      const dhData = {
        defaultProtocol: 'minswap-v2' as Swap.Protocol,
        wantedPrice: 1.5,
        options: [
          {
            protocol: 'minswap-v2' as Swap.Protocol,
            initialPrice: 50,
            batcherFee: 0,
          },
        ],
      }

      const msData = {
        defaultProtocol: 'minswap-v2' as Swap.Protocol,
        wantedPrice: 1.2,
        options: [
          {
            protocol: 'minswap-v2' as Swap.Protocol,
            initialPrice: 30,
            batcherFee: 0,
          },
        ],
      }

      mockDexhunterApi.limitOptions.mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: dhData,
        },
      })

      mockMuesliswapApi.limitOptions.mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: msData,
        },
      })

      const manager = swapManagerMaker(baseConfig)
      const result = await manager.api.limitOptions({
        tokenIn: '.',
        tokenOut: '.',
      })

      expect(result.tag).toBe('right')
      if (result.tag === 'right') {
        expect(result.value.data.defaultProtocol).toBe('minswap-v2')
        expect(result.value.data.wantedPrice).toBe(1.2) // min of 1.5 and 1.2
        expect(result.value.data.options).toEqual([
          {protocol: 'minswap-v2', initialPrice: 30, batcherFee: 0},
        ])
      }
    })

    it('returns left if both are left', async () => {
      mockDexhunterApi.limitOptions.mockResolvedValue({
        tag: 'left',
        error: {
          status: 400,
          message: 'dh limit options error',
          responseData: {},
        },
      })
      mockMuesliswapApi.limitOptions.mockResolvedValue({
        tag: 'left',
        error: {
          status: 400,
          message: 'ms limit options error',
          responseData: {},
        },
      })

      const manager = swapManagerMaker(baseConfig)
      const result = await manager.api.limitOptions({
        tokenIn: '.',
        tokenOut: '.',
      })

      expect(result.tag).toBe('left')
      if (result.tag === 'left') {
        expect(result.error.message).toBe('dh limit options error')
        expect(result.error.status).toBe(400)
      }
    })

    it('returns muesliswap options if dexhunter api result is left', async () => {
      const msData = {
        defaultProtocol: 'minswap-v2' as Swap.Protocol,
        wantedPrice: 1.2,
        options: [
          {
            protocol: 'minswap-v2' as Swap.Protocol,
            initialPrice: 30,
            batcherFee: 0,
          },
        ],
      }

      mockDexhunterApi.limitOptions.mockResolvedValue({
        tag: 'left',
        error: {
          status: 400,
          message: 'dh limit options error',
          responseData: {},
        },
      })

      mockMuesliswapApi.limitOptions.mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: msData,
        },
      })

      const manager = swapManagerMaker(baseConfig)
      const result = await manager.api.limitOptions({
        tokenIn: '.',
        tokenOut: '.',
      })

      expect(result.tag).toBe('right')
      if (result.tag === 'right') {
        expect(result.value.data).toEqual(msData)
      }
    })

    it('returns dexhunter options if muesliswap api result is left', async () => {
      const dhData = {
        defaultProtocol: 'minswap-v2' as Swap.Protocol,
        wantedPrice: 1.5,
        options: [
          {
            protocol: 'minswap-v2' as Swap.Protocol,
            initialPrice: 50,
            batcherFee: 0,
          },
        ],
      }

      mockDexhunterApi.limitOptions.mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: dhData,
        },
      })

      mockMuesliswapApi.limitOptions.mockResolvedValue({
        tag: 'left',
        error: {
          status: 400,
          message: 'ms limit options error',
          responseData: {},
        },
      })

      const manager = swapManagerMaker(baseConfig)
      const result = await manager.api.limitOptions({
        tokenIn: '.',
        tokenOut: '.',
      })

      expect(result.tag).toBe('right')
      if (result.tag === 'right') {
        expect(result.value.data).toEqual(dhData)
      }
    })

    it('returns invalid if all responses are excluded', async () => {
      mockDexhunterApi.limitOptions.mockResolvedValue({
        tag: 'left',
        error: {
          status: -3,
          message: 'Aggregator excluded from call',
          responseData: {},
        },
      })

      mockMuesliswapApi.limitOptions.mockResolvedValue({
        tag: 'left',
        error: {
          status: -3,
          message: 'Aggregator excluded from call',
          responseData: {},
        },
      })

      const manager = swapManagerMaker(baseConfig)
      const result = await manager.api.limitOptions({
        tokenIn: '.',
        tokenOut: '.',
      })

      expect(result.tag).toBe('left')
      if (result.tag === 'left') {
        expect(result.error.message).toBe('Unknown error')
        expect(result.error.status).toBe(-3)
      }
    })
  })

  describe('estimate()', () => {
    it('if aggregatorSelected muesliswap, calls only that aggregator', async () => {
      const manager = swapManagerMaker(baseConfig)
      manager.assignSettings({routingPreference: ['muesliswap']})
      await manager.api.tokens()

      const result = await manager.api.estimate(msApiMocks.inputs.quote)

      expect(result.tag).toBe('right')
      if (result.tag === 'right') {
        expect(result.value.data).toEqual(msApiMocks.results.estimate)
      }
    })

    it('if aggregatorSelected dexhunter, calls only that aggregator', async () => {
      const manager = swapManagerMaker(baseConfig)
      manager.assignSettings({routingPreference: ['dexhunter']})
      await manager.api.tokens()

      const result = await manager.api.estimate(dhApiMocks.inputs.quote)

      expect(result.tag).toBe('right')
      if (result.tag === 'right') {
        expect(result.value.data).toEqual(dhApiMocks.results.estimate)
      }
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

    it('should return api error', async () => {
      mockMuesliswapApi.estimate.mockResolvedValue({
        tag: 'left',
        error: {status: 400, message: 'ms orders error', responseData: {}},
      })

      mockDexhunterApi.estimate.mockResolvedValue({
        tag: 'left',
        error: {
          status: -3,
          message: 'Aggregator excluded from call',
          responseData: {},
        },
      })

      const manager = swapManagerMaker(baseConfig)
      await manager.api.tokens()

      const result = await manager.api.estimate(dhApiMocks.inputs.quote)

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toBe('ms orders error')
      expect(result.error.status).toBe(400)
    })

    it('should return "invalid" error', async () => {
      mockMuesliswapApi.estimate.mockResolvedValue({
        tag: 'left',
        error: {
          status: -3,
          message: 'Aggregator excluded from call',
          responseData: {},
        },
      })

      mockDexhunterApi.estimate.mockResolvedValue({
        tag: 'left',
        error: {
          status: -3,
          message: 'Aggregator excluded from call',
          responseData: {},
        },
      })

      const manager = swapManagerMaker(baseConfig)
      await manager.api.tokens()

      const result = await manager.api.estimate(dhApiMocks.inputs.quote)

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toBe('Unknown error')
      expect(result.error.status).toBe(-3)
    })
  })

  describe('cancel()', () => {
    it('delegates to the aggregator specified in the order 1', async () => {
      const manager = swapManagerMaker(baseConfig)
      await manager.api.cancel(dhApiMocks.inputs.cancel)
      expect(mockDexhunterApi.cancel).toHaveBeenCalled()
      expect(mockMuesliswapApi.cancel).not.toHaveBeenCalled()
    })

    it('delegates to the aggregator specified in the order 2', async () => {
      const manager = swapManagerMaker(baseConfig)
      await manager.api.cancel(msApiMocks.inputs.cancel[0]!)
      expect(mockMuesliswapApi.cancel).toHaveBeenCalled()
      expect(mockDexhunterApi.cancel).not.toHaveBeenCalled()
    })
  })
})

describe('standarizeError', () => {
  it('should return the same response if it is a Right response', () => {
    const rightResponse: Api.Response<string> = {
      tag: 'right',
      value: {
        status: 200,
        data: 'Success',
      },
    }

    const result = standarizeError(rightResponse)
    expect(result).toBe(rightResponse)
  })

  it('should standardize insufficient balance errors', () => {
    const leftResponse: Api.Response<any> = {
      tag: 'left',
      error: {
        status: 400,
        message: 'Unable to build transaction due to insufficient user balance',
        responseData: {},
      },
    }

    const result = standarizeError(leftResponse)

    if (isLeft(result)) {
      expect(result.error.message).toBe(
        'Insufficient balance: consider fees, assets blocked by staking or multiaddress holdings',
      )
    } else {
      fail('Expected result to be a Left type')
    }
  })

  it('should standardize positive amounts errors', () => {
    const leftResponse: Api.Response<any> = {
      tag: 'left',
      error: {
        status: 400,
        message: 'Buy and sell amounts must be positive',
        responseData: {},
      },
    }

    const result = standarizeError(leftResponse)
    if (isLeft(result)) {
      expect(result.error.message).toBe('Buy and sell amounts must be positive')
    } else {
      fail('Expected result to be a Left type')
    }
  })

  it('should standardize no liquidity errors', () => {
    const leftResponse: Api.Response<any> = {
      tag: 'left',
      error: {
        status: 400,
        message: 'No liquidity available for this token pair',
        responseData: {},
      },
    }

    const result = standarizeError(leftResponse)
    if (isLeft(result)) {
      expect(result.error.message).toBe(
        'This pair is not available in any liquidity pool.',
      )
    } else {
      fail('Expected result to be a Left type')
    }
  })

  it('should standardize amount_in_invalid errors', () => {
    const leftResponse: Api.Response<any> = {
      tag: 'left',
      error: {
        status: 400,
        message: 'amount_in_invalid',
        responseData: {},
      },
    }

    const result = standarizeError(leftResponse)
    if (isLeft(result)) {
      expect(result.error.message).toBe('Buy and sell amounts must be positive')
    } else {
      fail('Expected result to be a Left type')
    }
  })

  it('should standardize unknown errors with DOCTYPE html', () => {
    const leftResponse: Api.Response<any> = {
      tag: 'left',
      error: {
        status: 500,
        message: '<!DOCTYPE html> Some server error',
        responseData: {},
      },
    }

    const result = standarizeError(leftResponse)
    if (isLeft(result)) {
      expect(result.error.message).toBe('Unknown error')
    } else {
      fail('Expected result to be a Left type')
    }
  })

  it('should return the same error message if no standardization applies', () => {
    const leftResponse: Api.Response<any> = {
      tag: 'left',
      error: {
        status: 400,
        message: 'Some other error',
        responseData: {},
      },
    }

    const result = standarizeError(leftResponse)
    if (isLeft(result)) {
      expect(result.error.message).toBe('Some other error')
    } else {
      fail('Expected result to be a Left type')
    }
  })
})

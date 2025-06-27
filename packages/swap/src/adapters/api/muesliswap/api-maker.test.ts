import {fetchData} from '@yoroi/common'
import {Api, Chain, Left} from '@yoroi/types'

import {muesliswapApiMaker, parseMuesliError} from './api-maker'
import {api} from './api.mocks'
import {MuesliswapApiConfig} from './types'

jest.mock('@yoroi/common', () => ({
  fetchData: jest.fn(),
  isLeft: jest.requireActual('@yoroi/common').isLeft,
  difference: jest.requireActual('@yoroi/common').difference,
}))

describe('muesliswapApiMaker', () => {
  const mockFetchData = fetchData as jest.MockedFunction<typeof fetchData>

  const config: MuesliswapApiConfig = {
    addressHex: 'someAddressHex',
    address: 'someAddress',
    primaryTokenInfo: {} as any,
    isPrimaryToken: () => false,
    stakingKey: 'someStakingKey',
    network: Chain.Network.Mainnet,
    partner: 'somePartnerId',
  }

  afterEach(() => {
    mockFetchData.mockReset()
  })

  it('should return an object with the Swap.Api interface', () => {
    const muesliApi = muesliswapApiMaker(config)
    expect(muesliApi).toHaveProperty('tokens')
    expect(muesliApi).toHaveProperty('orders')
    expect(muesliApi).toHaveProperty('estimate')
    expect(muesliApi).toHaveProperty('create')
    expect(muesliApi).toHaveProperty('cancel')
  })

  it('should return error if network is not Mainnet', async () => {
    const testConfig: MuesliswapApiConfig = {
      ...config,
      network: Chain.Network.Preprod,
    }
    const muesliApi = muesliswapApiMaker(testConfig)

    const result = await muesliApi.tokens()

    if (result.tag !== 'left') fail()
    expect(result.tag).toBe('left')
    expect(result.error.message).toMatch(/works on mainnet/)
  })

  describe('tokens()', () => {
    it('returns a successful response', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: Api.HttpStatusCode.Ok,
          data: api.responses.tokens,
        },
      })

      const muesliApi = muesliswapApiMaker(config)
      const result = await muesliApi.tokens()
      expect(mockFetchData).toHaveBeenCalledWith({
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'get',
        url: 'https://aggregator-v2.muesliswap.com/tokens',
      })
      expect(result.tag).toBe('right')
    })

    it('returns an error (isLeft)', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'left',
        error: {
          status: 500,
          message: 'Server error',
          responseData: {detail: 'something went wrong'},
        },
      })

      const muesliApi = muesliswapApiMaker(config)
      const result = await muesliApi.tokens()

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toContain('something went wrong')
    })
  })

  describe('orders()', () => {
    it('should return a successful transformed response', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: Api.HttpStatusCode.Ok,
          data: {
            ...api.responses.orders,
            orders: [
              ...api.responses.orders.orders,
              {
                dex: 'sundaeswap-v1',
                aggregator: null,
                fromToken: '.',
                toToken:
                  '4cb48d60d1f7823d1307c61b9ecf472ff78cf22d1ccc5786d59461f8.4144414d4f4f4e',
                fromAmount: '0.000036',
                toAmount: '10',
                paidAmount: '0.000036',
                receivedAmount: '11',
                batcherFee: '2.500000',
                attachedValues: [
                  {
                    amount: 4500036,
                    token: '.',
                  },
                ],
                sender:
                  'addr1q9r502tqdksvqmhs3lwlxx5f5cz0c92cftqqludl3r0urtk0ppwv8x4ylafdu84xqmh9sx4vrk4czekksv884xmvanwql6sl74',
                beneficiary:
                  'addr1q9r502tqdksvqmhs3lwlxx5f5cz0c92cftqqludl3r0urtk0ppwv8x4ylafdu84xqmh9sx4vrk4czekksv884xmvanwql6sl74',
                txHash:
                  '29f51a2a9e46ced05f03abc9b419ae57164dc056534121f041d69e307b9722f8',
                outputIdx: 0,
                deposit: '2.000000',
                status: 'matched',
                placedAt: undefined,
                finalizedAt: undefined,
                finalizedTxHash:
                  '8d3b20bafb8378366f819f506da327a43e94d6948c002bac00a9b1de401bc571',
                providerSpecifics: {
                  poolId: '1701',
                  swapDirection: 0,
                },
              },
              {
                dex: 'minswap-v2',
                aggregator: null,
                fromToken: '.',
                toToken:
                  '49e423161ef818adc475c783571cb479d5f15ad52a01a240eacc0d3b.434f434b',
                fromAmount: '0.008137',
                toAmount: '1',
                paidAmount: '0.000000',
                receivedAmount: '0',
                batcherFee: '2.000000',
                attachedValues: [
                  {
                    amount: 4008137,
                    token: '.',
                  },
                ],
                sender:
                  'addr1q9r502tqdksvqmhs3lwlxx5f5cz0c92cftqqludl3r0urtk0ppwv8x4ylafdu84xqmh9sx4vrk4czekksv884xmvanwql6sl74',
                beneficiary:
                  'addr1q9r502tqdksvqmhs3lwlxx5f5cz0c92cftqqludl3r0urtk0ppwv8x4ylafdu84xqmh9sx4vrk4czekksv884xmvanwql6sl74',
                txHash:
                  '475ffb1f1820eee1790729d86ced473e9f7724ddcd7bf59b477e3293415f16bf',
                outputIdx: 0,
                deposit: '2.000000',
                status: 'canceled',
                placedAt: undefined,
                finalizedAt: undefined,
                finalizedTxHash: null,
                providerSpecifics: null,
              },
            ],
          },
        },
      })

      const muesliApi = muesliswapApiMaker(config)
      const result = await muesliApi.orders()
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://aggregator-v2.muesliswap.com/order_history',
          method: 'get',
        }),
        {
          params: {
            user_address: 'someAddress',
            numbers_have_decimals: true,
          },
        },
      )

      expect(result.tag).toBe('right')
    })

    it('should return error (isLeft) when the response is left', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'left',
        error: {
          status: 500,
          message: 'Some error',
          responseData: {detail: 'orderHistory error'},
        },
      })

      const muesliApi = muesliswapApiMaker(config)
      const result = await muesliApi.orders()

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toContain('orderHistory error')
    })

    it('should return left if transformer throws an error', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: Api.HttpStatusCode.Ok,
          data: {},
        },
      })

      const muesliApi = muesliswapApiMaker(config)
      const result = await muesliApi.orders()

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toBe('Failed to transform orderHistory')
    })
  })

  describe('estimate()', () => {
    it('calls /quote if wantedPrice is undefined', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: Api.HttpStatusCode.Ok,
          data: api.responses.quote,
        },
      })

      const muesliApi = muesliswapApiMaker(config)
      // has not wantedPrice
      const result = await muesliApi.estimate(api.inputs.quote)

      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://aggregator-v2.muesliswap.com/quote',
          method: 'post',
          data: expect.any(Object),
        }),
      )
      expect(result.tag).toBe('right')
    })

    it('calls /limit_order_quote if wantedPrice is provided', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: Api.HttpStatusCode.Ok,
          data: api.responses.quote,
        },
      })

      const muesliApi = muesliswapApiMaker(config)
      // has wantedPrice
      const result = await muesliApi.estimate({
        slippage: 0.01,
        tokenIn: '.',
        tokenOut:
          'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
        protocol: 'minswap-v1',
        wantedPrice: 1,
        amountOut: undefined,
        amountIn: 1,
        multiples: 1,
      })

      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          url: 'https://aggregator-v2.muesliswap.com/limit_order_quote',
          method: 'post',
          data: expect.any(Object),
        }),
      )
      expect(result.tag).toBe('right')
    })

    it('should return error (isLeft) when the response is left', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'left',
        error: {
          status: 500,
          message: 'Some error',
          responseData: {detail: 'random error'},
        },
      })

      const muesliApi = muesliswapApiMaker(config)
      const result = await muesliApi.estimate(api.inputs.quote)

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toContain('random error')
    })
  })

  describe('create()', () => {
    it('calls /order if no wantedPrice', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: Api.HttpStatusCode.Ok,
          data: api.responses.create,
        },
      })

      const muesliApi = muesliswapApiMaker(config)
      const result = await muesliApi.create(api.inputs.create[0]!)

      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://aggregator-v2.muesliswap.com/order',
          method: 'post',
          data: expect.any(Object),
        }),
      )
      expect(result.tag).toBe('right')
    })

    it('calls /limit_order if wantedPrice is provided', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: Api.HttpStatusCode.Ok,
          data: api.responses.createLimit,
        },
      })

      const muesliApi = muesliswapApiMaker(config)
      const result = await muesliApi.create(api.inputs.createLimit[0]!)

      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://aggregator-v2.muesliswap.com/limit_order',
          method: 'post',
          data: expect.any(Object),
        }),
      )
      expect(result.tag).toBe('right')
    })

    it('should return error (isLeft) when the response is left', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'left',
        error: {
          status: 500,
          message: 'Some error',
          responseData: {detail: 'random error'},
        },
      })

      const muesliApi = muesliswapApiMaker(config)
      const result = await muesliApi.create(api.inputs.createLimit[0]!)

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toContain('random error')
    })
  })

  describe('cancel()', () => {
    it('calls /cancel endpoint successfully', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: Api.HttpStatusCode.Ok,
          data: api.responses.cancel,
        },
      })

      const muesliApi = muesliswapApiMaker(config)
      const result = await muesliApi.cancel(api.inputs.cancel[0]!)

      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://aggregator-v2.muesliswap.com/cancel',
          method: 'post',
          data: expect.any(Object),
        }),
      )
      expect(result.tag).toBe('right')
    })

    it('handles error response', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'left',
        error: {
          status: 500,
          message: 'Cancel error',
          responseData: {detail: 'could not cancel'},
        },
      })

      const muesliApi = muesliswapApiMaker(config)
      const result = await muesliApi.cancel(api.inputs.cancel[1]!)

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toContain('could not cancel')
    })
  })
})

describe('parseMuesliError', () => {
  it('parses error when responseData.detail is present', () => {
    const input: Left<Api.ResponseError> = {
      tag: 'left',
      error: {
        status: 500,
        message: 'Cancel error',
        responseData: {detail: 'could not cancel'},
      },
    }
    const result = parseMuesliError(input)

    expect(result.tag).toBe('left')
    expect(result.error.message).toBe('could not cancel')
    expect(Object.isFrozen(result)).toBe(true)
  })

  it('falls back to default message when responseData.detail is absent', () => {
    const input = {
      tag: 'left',
      error: {
        status: 500,
        message: 'Cancel error',
      },
    } as Left<Api.ResponseError>

    const result = parseMuesliError(input)

    expect(result.tag).toBe('left')
    expect(result.error.message).toBe('Muesliswap API error')

    expect(Object.isFrozen(result)).toBe(true)
  })

  it('strips leading and trailing quotes if detail is a JSON string', () => {
    const input: Left<Api.ResponseError> = {
      tag: 'left',
      error: {
        status: 500,
        message: 'Cancel error',
        responseData: {detail: 'could not "cancel"'},
      },
    }

    const result = parseMuesliError(input)

    expect(result.error.message).toBe('could not \\"cancel\\"')
    expect(Object.isFrozen(result)).toBe(true)
  })
})

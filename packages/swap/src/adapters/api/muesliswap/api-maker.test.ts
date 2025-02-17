import {fetchData} from '@yoroi/common'
import {Chain} from '@yoroi/types'

import {MuesliswapApiConfig, muesliswapApiMaker} from './api-maker'
import {api} from './api.mocks'

jest.mock('@yoroi/common', () => ({
  fetchData: jest.fn(),
  isLeft: jest.requireActual('@yoroi/common').isLeft,
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
          status: 200,
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
          status: 200,
          data: api.responses.orders,
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
          status: 200,
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
          status: 200,
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
        }),
        {
          params: expect.any(Object),
        },
      )
      expect(result.tag).toBe('right')
    })

    it('calls /limit_order_quote if wantedPrice is provided', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: 200,
          data: api.responses.quote,
        },
      })

      const muesliApi = muesliswapApiMaker(config)
      // has wantedPrice
      const result = await muesliApi.estimate(api.inputs.quoteLimit)

      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          url: 'https://aggregator-v2.muesliswap.com/quote',
          method: 'post',
        }),
        {
          params: expect.any(Object),
        },
      )
      expect(result.tag).toBe('right')
    })
  })
})

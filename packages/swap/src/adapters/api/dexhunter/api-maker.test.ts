import {fetchData} from '@yoroi/common'
import {Api, Chain} from '@yoroi/types'

import {dexhunterApiMaker, DexhunterApiConfig} from './api-maker'
import {api} from './api.mocks'

jest.mock('@yoroi/common', () => ({
  fetchData: jest.fn(),
  isLeft: jest.requireActual('@yoroi/common').isLeft,
  difference: jest.requireActual('@yoroi/common').difference,
}))

describe('dexhunterApiMaker', () => {
  const mockFetchData = fetchData as jest.MockedFunction<typeof fetchData>

  const config: DexhunterApiConfig = {
    address: 'someAddress',
    primaryTokenInfo: {} as any,
    isPrimaryToken: () => false,
    partnerId: 'somePartnerId',
    partnerCode: 'somePartnerCode',
    network: Chain.Network.Mainnet,
    // request defaults to fetchData, so we don't need to provide it explicitly
  }

  afterEach(() => {
    mockFetchData.mockReset()
  })

  it('should return an object with the Swap.Api interface', () => {
    const dhApi = dexhunterApiMaker(config)
    expect(dhApi).toHaveProperty('tokens')
    expect(dhApi).toHaveProperty('orders')
    expect(dhApi).toHaveProperty('protocols')
    expect(dhApi).toHaveProperty('estimate')
    expect(dhApi).toHaveProperty('create')
    expect(dhApi).toHaveProperty('cancel')
  })

  it('should return error if network is not Mainnet', async () => {
    const testConfig: DexhunterApiConfig = {
      ...config,
      network: Chain.Network.Preprod,
    }
    const dhApi = dexhunterApiMaker(testConfig)

    const result = await dhApi.tokens()

    if (result.tag !== 'left') fail()
    expect(result.tag).toBe('left')
    expect(result.error.message).toMatch(/only works on mainnet/)
  })

  describe('tokens()', () => {
    it('should return a successful transformed response', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: Api.HttpStatusCode.Ok,
          data: api.responses.tokens,
        },
      })

      const dhApi = dexhunterApiMaker(config)
      const result = await dhApi.tokens()

      expect(mockFetchData).toHaveBeenCalledWith({
        method: 'get',
        url: 'https://api-us.dexhunterv3.app/swap/tokens',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Partner-Id': 'somePartnerId',
        },
      })
      expect(result.tag).toBe('right')
    })

    it('should return a left (error) if Dexhunter fails', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'left',
        error: {
          status: 500,
          message: 'Server error',
          responseData: {detail: 'Tokens error'},
        },
      })

      const dhApi = dexhunterApiMaker(config)
      const result = await dhApi.tokens()

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toContain('Tokens error')
    })
  })

  describe('orders()', () => {
    it('should return a successful transformed response', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: Api.HttpStatusCode.Ok,
          data: api.responses.orders,
        },
      })

      const dhApi = dexhunterApiMaker(config)
      const result = await dhApi.orders()

      expect(mockFetchData).toHaveBeenCalledWith({
        method: 'get',
        url: 'https://api-us.dexhunterv3.app/swap/orders/someAddress',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Partner-Id': 'somePartnerId',
        },
      })
      expect(result.tag).toBe('right')
    })

    it('should return a left if Dexhunter fails', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'left',
        error: {
          status: 404,
          message: 'Not found',
          responseData: {detail: 'No orders for this address'},
        },
      })

      const dhApi = dexhunterApiMaker(config)
      const result = await dhApi.orders()

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toContain('No orders for this address')
    })
  })

  describe('protocols()', () => {
    it('should return a right result with transformed data', async () => {
      const dhApi = dexhunterApiMaker(config)
      const result = await dhApi.protocols()

      if (result.tag !== 'right') fail()
      expect(result.tag).toBe('right')
      expect(result.value.status).toBe(Api.HttpStatusCode.Ok)
    })
  })

  describe('estimate()', () => {
    it('calls /swap/estimate if neither wantedPrice nor amountOut are given', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: 200,
          data: api.responses.estimate,
        },
      })

      const dhApi = dexhunterApiMaker(config)
      const result = await dhApi.estimate(api.inputs.estimate)

      expect(mockFetchData).toHaveBeenCalledWith({
        method: 'post',
        url: 'https://api-us.dexhunterv3.app/swap/estimate',
        headers: expect.objectContaining({
          'X-Partner-Id': 'somePartnerId',
        }),
        data: expect.any(Object),
      })
      expect(result.tag).toBe('right')
    })

    it('calls /swap/reverseEstimate if amountOut is provided', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: 200,
          data: api.responses.reverseEstimate,
        },
      })

      const dhApi = dexhunterApiMaker(config)
      const result = await dhApi.estimate(api.inputs.reverseEstimate)

      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api-us.dexhunterv3.app/swap/reverseEstimate',
          method: 'post',
        }),
      )
      expect(result.tag).toBe('right')
    })

    // it('calls /swap/limit/estimate if wantedPrice is provided', async () => {
    //   mockFetchData.mockResolvedValueOnce({
    //     tag: 'right',
    //     value: {
    //       status: 200,
    //       data: api.responses.estimate,
    //     },
    //   })

    //   const dhApi = dexhunterApiMaker(config)
    //   const result = await dhApi.estimate(api.inputs.estimate)

    //   expect(mockFetchData).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       url: 'https://api-us.dexhunterv3.app/swap/limit/estimate',
    //     }),
    //     undefined,
    //   )
    //   expect(result.tag).toBe('right')
    // })

    // it('should return a left if Dexhunter fails (server error)', async () => {
    //   mockFetchData.mockResolvedValueOnce({
    //     tag: 'left',
    //     error: {
    //       status: 400,
    //       message: 'Bad request',
    //       responseData: {detail: 'estimate error'},
    //     },
    //   })

    //   const dhApi = dexhunterApiMaker(config)
    //   const result = await dhApi.estimate({
    //     from: {tokenId: 'abc', amount: '100'},
    //     to: {tokenId: 'xyz'},
    //   })

    //   expect(result.tag).toBe('left')
    //   expect(result.error.message).toContain('estimate error')
    // })
  })

  // describe('create()', () => {
  //   it('calls /swap/build if wantedPrice is not provided', async () => {
  //     mockFetchData.mockResolvedValueOnce({
  //       tag: 'right',
  //       value: {
  //         status: 200,
  //         data: api.responses.build,
  //       },
  //     })

  //     const dhApi = dexhunterApiMaker(config)
  //     const result = await dhApi.create({
  //       from: {tokenId: 'abc', amount: '100'},
  //       to: {tokenId: 'xyz'},
  //       // no wantedPrice => 'build'
  //     })

  //     expect(mockFetchData).toHaveBeenCalledWith(
  //       {
  //         method: 'post',
  //         url: 'https://api-us.dexhunterv3.app/swap/build',
  //         headers: expect.objectContaining({
  //           'X-Partner-Id': 'somePartnerId',
  //         }),
  //         data: expect.any(Object),
  //       },
  //       undefined,
  //     )
  //     expect(result.tag).toBe('right')
  //   })

  //   it('calls /swap/limit/build if wantedPrice is provided', async () => {
  //     mockFetchData.mockResolvedValueOnce({
  //       tag: 'right',
  //       value: {
  //         status: 200,
  //         data: api.responses.limitBuild,
  //       },
  //     })

  //     const dhApi = dexhunterApiMaker(config)
  //     const result = await dhApi.create({
  //       from: {tokenId: 'abc', amount: '100'},
  //       to: {tokenId: 'xyz'},
  //       wantedPrice: '9.99',
  //     })

  //     expect(mockFetchData).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         url: 'https://api-us.dexhunterv3.app/swap/limit/build',
  //       }),
  //       undefined,
  //     )
  //     expect(result.tag).toBe('right')
  //   })

  //   it('should return a left if Dexhunter fails', async () => {
  //     mockFetchData.mockResolvedValueOnce({
  //       tag: 'left',
  //       error: {
  //         status: 500,
  //         message: 'Create error',
  //         responseData: {detail: 'could not build swap'},
  //       },
  //     })

  //     const dhApi = dexhunterApiMaker(config)
  //     const result = await dhApi.create({
  //       from: {tokenId: 'abc', amount: '100'},
  //       to: {tokenId: 'xyz'},
  //     })

  //     expect(result.tag).toBe('left')
  //     expect(result.error.message).toContain('could not build swap')
  //   })
  // })

  // describe('cancel()', () => {
  //   it('calls /swap/cancel successfully', async () => {
  //     mockFetchData.mockResolvedValueOnce({
  //       tag: 'right',
  //       value: {
  //         status: 200,
  //         data: api.responses.cancel,
  //       },
  //     })

  //     const dhApi = dexhunterApiMaker(config)
  //     const result = await dhApi.cancel({orderId: '1234'})

  //     expect(mockFetchData).toHaveBeenCalledWith(
  //       {
  //         method: 'post',
  //         url: 'https://api-us.dexhunterv3.app/swap/cancel',
  //         headers: expect.objectContaining({
  //           'X-Partner-Id': 'somePartnerId',
  //         }),
  //         data: expect.any(Object),
  //       },
  //       undefined,
  //     )
  //     expect(result.tag).toBe('right')
  //   })

  //   it('should return a left if Dexhunter fails', async () => {
  //     mockFetchData.mockResolvedValueOnce({
  //       tag: 'left',
  //       error: {
  //         status: 500,
  //         message: 'Cancel error',
  //         responseData: {detail: 'could not cancel'},
  //       },
  //     })

  //     const dhApi = dexhunterApiMaker(config)
  //     const result = await dhApi.cancel({orderId: '1234'})

  //     expect(result.tag).toBe('left')
  //     expect(result.error.message).toContain('could not cancel')
  //   })
  // })
})

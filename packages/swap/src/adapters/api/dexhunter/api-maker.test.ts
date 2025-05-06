import {fetchData} from '@yoroi/common'
import {Api, Chain} from '@yoroi/types'

import {dexhunterApiMaker, DexhunterApiConfig} from './api-maker'
import {api} from './api.mocks'
import {BuildResponse, LimitBuildResponse} from './types'

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
    partner: 'somePartnerId',
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
    expect(dhApi).toHaveProperty('limitOptions')
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

    it('should return a left (error) if response is not JSON', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'left',
        error: {
          status: 500,
          message: '',
          responseData: null,
        },
      })

      const dhApi = dexhunterApiMaker(config)
      const result = await dhApi.tokens()

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toContain('Dexhunter API error')
    })
  })

  describe('orders()', () => {
    it('should return a successful transformed response', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: Api.HttpStatusCode.Ok,
          data: [
            ...api.responses.orders,
            {
              _id: '000000000000000000000000',
              token_id_in:
                '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e776f726c646d6f62696c65746f6b656e',
              token_id_out:
                '000000000000000000000000000000000000000000000000000000006c6f76656c616365',
              dex: 'MUESLISWAP',
              status: 'COMPLETE',
              user_address:
                'addr1q9qhyvkm5fytm5ckgshny0zz08a3urhhh7ckdqxcm27av40eafn3v5lr2w2n2er9uj7c743mt42gpe8tgek6394z9t7qn4yjzl',
              user_stake:
                'stake1u8u75eck203489f4v3j7f0v02ca464yqun45vmdgj63z4lqm9pu9k',
              amount_in: 15.330409,
              expected_out_amount: 3.756354,
              actual_out_amount: 5.801912,
              is_dexhunter: false,
              submission_time: undefined,
              last_update: undefined,
              tx_hash:
                'ldlldpldlpelpflepflepflpelfpelfpleplfpelfpelfplepflpelfpelfpelfp',
              output_index: 0,
              update_tx_hash:
                'a8b77336d8600f1c8dac0ed90d0ab9c4f1e815bb25f4e168aaaadd130f81457d',
              is_stop_loss: false,
              is_oor: false,
              batcher_fee: 1.15,
              deposit: 1,
            },
            {
              _id: '111111111111111111111111',
              token_id_in:
                '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e776f726c646d6f62696c65746f6b656e',
              token_id_out:
                '000000000000000000000000000000000000000000000000000000006c6f76656c616365',
              dex: 'MUESLISWAP',
              status: 'COMPLETE',
              user_address:
                'addr1q9qhyvkm5fytm5ckgshny0zz08a3urhhh7ckdqxcm27av40eafn3v5lr2w2n2er9uj7c743mt42gpe8tgek6394z9t7qn4yjzl',
              user_stake:
                'stake1u8u75eck203489f4v3j7f0v02ca464yqun45vmdgj63z4lqm9pu9k',
              amount_in: 15.330409,
              expected_out_amount: 3.756354,
              actual_out_amount: 5.801912,
              is_dexhunter: false,
              submission_time: undefined,
              last_update: undefined,
              tx_hash:
                'kskskkskskskskkskskskkskskkskskskkskskskkskskkskskskkskskskskksk',
              output_index: 0,
              update_tx_hash:
                'a8b77336d8600f1c8dac0ed90d0ab9c4f1e815bb25f4e168aaaadd130f81457d',
              is_stop_loss: false,
              is_oor: false,
              batcher_fee: 1.15,
              deposit: 1,
            },
          ],
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

    it('calls /swap/limit/estimate if wantedPrice is provided', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: 200,
          data: {...api.responses.estimate, wantedPrice: 1},
        },
      })

      const dhApi = dexhunterApiMaker(config)
      const result = await dhApi.estimate({
        ...api.inputs.estimate,
        wantedPrice: 1,
      })

      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            amount_in: 10,
            blacklisted_dexes: ['WINGRIDER'],
            dex: 'MINSWAP',
            multiples: 1,
            token_in: '',
            token_out:
              'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950',
            wanted_price: 1,
          },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Partner-Id': 'somePartnerId',
          },
          method: 'post',
          url: 'https://api-us.dexhunterv3.app/swap/limit/estimate',
        }),
      )
      expect(result.tag).toBe('right')
    })

    it('should return a left if Dexhunter fails (server error)', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'left',
        error: {
          status: 400,
          message: 'Bad request',
          responseData: {detail: 'estimate error'},
        },
      })

      const dhApi = dexhunterApiMaker(config)
      const result = await dhApi.estimate(api.inputs.estimate)

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toContain('estimate error')
    })
  })

  describe('create()', () => {
    it('calls /swap/build if wantedPrice is not provided', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: 200,
          data: {} as BuildResponse,
        },
      })

      const dhApi = dexhunterApiMaker(config)
      const result = await dhApi.create(api.inputs.create[0]!)

      expect(mockFetchData).toHaveBeenCalledWith({
        method: 'post',
        url: 'https://api-us.dexhunterv3.app/swap/build',
        headers: expect.objectContaining({
          'X-Partner-Id': 'somePartnerId',
        }),
        data: expect.any(Object),
      })
      expect(result.tag).toBe('right')
    })

    it('calls /swap/limit/build if wantedPrice is provided', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: 200,
          data: {} as LimitBuildResponse,
        },
      })

      const dhApi = dexhunterApiMaker(config)
      const result = await dhApi.create(api.inputs.create[2]!)

      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api-us.dexhunterv3.app/swap/limit/build',
        }),
      )
      expect(result.tag).toBe('right')
    })

    it('should return a left if Dexhunter fails', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'left',
        error: {
          status: 500,
          message: 'Create error',
          responseData: {detail: 'could not build swap'},
        },
      })

      const dhApi = dexhunterApiMaker(config)
      const result = await dhApi.create(api.inputs.create[0]!)

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toContain('could not build swap')
    })
  })

  describe('cancel()', () => {
    it('calls /swap/cancel successfully', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'right',
        value: {
          status: 200,
          data: api.responses.cancel,
        },
      })

      const dhApi = dexhunterApiMaker(config)
      const result = await dhApi.cancel(api.inputs.cancel)

      expect(mockFetchData).toHaveBeenCalledWith({
        method: 'post',
        url: 'https://api-us.dexhunterv3.app/swap/cancel',
        headers: expect.objectContaining({
          'X-Partner-Id': 'somePartnerId',
        }),
        data: expect.any(Object),
      })
      expect(result.tag).toBe('right')
    })

    it('should return a left if Dexhunter fails', async () => {
      mockFetchData.mockResolvedValueOnce({
        tag: 'left',
        error: {
          status: 500,
          message: 'Cancel error',
          responseData: {detail: 'could not cancel'},
        },
      })

      const dhApi = dexhunterApiMaker(config)
      const result = await dhApi.cancel(api.inputs.cancel)

      if (result.tag !== 'left') fail()
      expect(result.tag).toBe('left')
      expect(result.error.message).toContain('could not cancel')
    })
  })
})

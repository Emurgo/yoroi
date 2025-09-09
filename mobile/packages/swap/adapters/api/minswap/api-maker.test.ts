import {isLeft, isRight} from '@yoroi/common'
import {Chain, Portfolio} from '@yoroi/types'

import {minswapApiMaker} from './api-maker'

const mockConfig = {
  address: 'addr1test',
  network: Chain.Network.Mainnet as Chain.SupportedNetworks,
  primaryTokenInfo: {
    id: '.' as const,
    name: 'Cardano',
    ticker: 'ADA',
    decimals: 6,
    logo: null,
    description: '',
    website: '',
    policyId: '',
    fingerprint: '',
    group: 'ADA',
    kind: 'ft',
    image: null,
    icon: null,
    symbol: 'ADA',
    metadatas: {},
    isPrimaryToken: true,
    status: Portfolio.Token.Status.Valid,
    application: Portfolio.Token.Application.General,
    tag: '',
    reference: '',
    originalImage: '',
    nature: Portfolio.Token.Nature.Primary,
    type: Portfolio.Token.Type.FT,
  } as Portfolio.Token.Info,
  isPrimaryToken: (token: string | null | undefined) => token === '.',
  request: jest.fn(),
}

describe('minswapApiMaker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return proxy for non-mainnet networks', async () => {
    const config = {
      ...mockConfig,
      network: Chain.Network.Preprod as Chain.SupportedNetworks,
    }
    const api = minswapApiMaker(config)

    expect(api.tokens()).toEqual({
      tag: 'left',
      error: {
        status: -3,
        message: 'Minswap api only works on mainnet',
      },
    })
  })

  it('should create API instance for mainnet', () => {
    const api = minswapApiMaker(mockConfig)

    expect(api).toBeDefined()
    expect(typeof api.tokens).toBe('function')
    expect(typeof api.orders).toBe('function')
    expect(typeof api.estimate).toBe('function')
    expect(typeof api.create).toBe('function')
    expect(typeof api.cancel).toBe('function')
    expect(typeof api.limitOptions).toBe('function')
  })

  it('should handle tokens request', async () => {
    const mockResponse = {
      tag: 'right' as const,
      value: {
        status: 200,
        data: {
          tokens: [
            {
              asset: {
                token_id: 'lovelace',
                logo: null,
                ticker: 'ADA',
                is_verified: true,
                price_by_ada: 1,
                project_name: 'Cardano',
                decimals: 6,
              },
            },
          ],
          total: 1,
          page: 1,
          limit: 1000,
        },
      },
    }

    mockConfig.request = jest.fn().mockResolvedValue(mockResponse)
    const api = minswapApiMaker(mockConfig)

    const result = await api.tokens()

    expect(isRight(result)).toBe(true)
    if (isRight(result)) {
      expect(result.value.data).toHaveLength(1)
      expect(result.value.data[0].id).toBe('.')
      expect(result.value.data[0].ticker).toBe('ADA')
    }
  })

  it('should handle orders request', async () => {
    const mockResponse = {
      tag: 'right' as const,
      value: {
        status: 200,
        data: {
          orders: [
            {
              owner_address: 'addr1test',
              protocol: 'MinswapV2',
              token_in: {
                token_id: 'lovelace',
                logo: null,
                ticker: 'ADA',
                is_verified: true,
                price_by_ada: 1,
                project_name: 'Cardano',
                decimals: 6,
              },
              token_out: {
                token_id:
                  'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441',
                logo: null,
                ticker: 'TEST',
                is_verified: true,
                price_by_ada: 0.1,
                project_name: 'Test Token',
                decimals: 6,
              },
              amount_in: '100',
              min_amount_out: '1000',
              created_at: Date.now(),
              tx_in: 'txhash#0',
              dex_fee: '1',
              deposit: '2',
            },
          ],
          amount_in_decimal: true,
        },
      },
    }

    mockConfig.request = jest.fn().mockResolvedValue(mockResponse)
    const api = minswapApiMaker(mockConfig)

    const result = await api.orders()

    expect(isRight(result)).toBe(true)
    if (isRight(result)) {
      expect(result.value.data).toHaveLength(1)
      expect(result.value.data[0].txHash).toBe('txhash')
      expect(result.value.data[0].outputIndex).toBe(0)
      expect(result.value.data[0].aggregator).toBe('minswap')
    }
  })

  it('should handle estimate request', async () => {
    const mockResponse = {
      tag: 'right' as const,
      value: {
        status: 200,
        data: {
          amount_in: '10',
          amount_out: '8.290409',
          min_amount_out: '8.208325',
          deposits: '2',
          aggregator_fee: '0',
          total_dex_fee: '0.7',
          avg_price_impact: 0.3,
          paths: [
            [
              {
                amount_in: '10',
                amount_out: '8.290409',
                deposits: '2',
                dex_fee: '0.7',
                lp_fee: '0.03',
                min_amount_out: '8.208325',
                pool_id: 'pool123',
                price_impact: 0.3,
                protocol: 'MinswapV2',
              },
            ],
          ],
        },
      },
    }

    mockConfig.request = jest.fn().mockResolvedValue(mockResponse)
    const api = minswapApiMaker(mockConfig)

    const result = await api.estimate({
      amountIn: 10,
      tokenIn: '.' as const,
      tokenOut:
        'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
      slippage: 1,
    })

    expect(isRight(result)).toBe(true)
    if (isRight(result)) {
      expect(result.value.data.totalInput).toBe(10)
      expect(result.value.data.totalOutput).toBe(8.290409)
      expect(result.value.data.splits).toHaveLength(1)
    }
  })

  it('should handle create request', async () => {
    const mockResponse = {
      tag: 'right' as const,
      value: {
        status: 200,
        data: {
          cbor: 'test-cbor-data',
        },
      },
    }

    mockConfig.request = jest.fn().mockResolvedValue(mockResponse)
    const api = minswapApiMaker(mockConfig)

    const result = await api.create({
      amountIn: 10,
      tokenIn: '.' as const,
      tokenOut:
        'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
      slippage: 1,
    })

    expect(isRight(result)).toBe(true)
    if (isRight(result)) {
      expect(result.value.data.cbor).toBe('test-cbor-data')
      expect(result.value.data.aggregator).toBe('minswap')
    }
  })

  it('should handle limitOptions when estimate fails', async () => {
    const mockErrorResponse = {
      tag: 'left' as const,
      error: {
        status: 400,
        message: 'Estimate failed',
        responseData: {},
      },
    }

    mockConfig.request = jest.fn().mockResolvedValue(mockErrorResponse)
    const api = minswapApiMaker(mockConfig)

    const result = await api.limitOptions({
      tokenIn: '.' as const,
      tokenOut:
        'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
    })

    expect(isLeft(result)).toBe(true)
    if (isLeft(result)) {
      expect(result.error.message).toBe('Estimate failed')
      expect(result.error.status).toBe(400)
    }
  })

  it('should handle limitOptions request', async () => {
    const mockResponse = {
      tag: 'right' as const,
      value: {
        status: 200,
        data: {
          amount_in: '50',
          amount_out: '41.45',
          min_amount_out: '41.04',
          deposits: '2',
          aggregator_fee: '0',
          total_dex_fee: '0.7',
          avg_price_impact: 0.3,
          paths: [
            [
              {
                amount_in: '50',
                amount_out: '41.45',
                deposits: '2',
                dex_fee: '0.7',
                lp_fee: '0.03',
                min_amount_out: '41.04',
                pool_id: 'pool123',
                price_impact: 0.3,
                protocol: 'MinswapV2',
              },
            ],
          ],
        },
      },
    }

    mockConfig.request = jest.fn().mockResolvedValue(mockResponse)
    const api = minswapApiMaker(mockConfig)

    const result = await api.limitOptions({
      tokenIn: '.' as const,
      tokenOut:
        'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
    })

    expect(isRight(result)).toBe(true)
    if (isRight(result)) {
      expect(result.value.data.defaultProtocol).toBe('minswap-v2')
      expect(result.value.data.options).toHaveLength(1)
    }
  })

  it('should handle cancel request', async () => {
    const mockResponse = {
      tag: 'right' as const,
      value: {
        status: 200,
        data: {
          cbor: 'cancel-cbor-data',
        },
      },
    }

    mockConfig.request = jest.fn().mockResolvedValue(mockResponse)
    const api = minswapApiMaker(mockConfig)

    const result = await api.cancel({
      order: {
        aggregator: 'minswap' as const,
        protocol: 'minswap-v2' as const,
        txHash: 'txhash',
        outputIndex: 0,
        tokenIn: '.' as const,
        tokenOut:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
        amountIn: 10,
        actualAmountOut: 8,
        expectedAmountOut: 8,
        placedAt: Date.now(),
        lastUpdate: Date.now(),
        status: 'open' as const,
      },
    })

    expect(isRight(result)).toBe(true)
    if (isRight(result)) {
      expect(result.value.data.cbor).toBe('cancel-cbor-data')
    }
  })

  it('should handle API errors gracefully', async () => {
    const mockError = {
      tag: 'left' as const,
      error: {
        status: 500,
        message: 'Internal server error',
        responseData: {},
      },
    }

    mockConfig.request = jest.fn().mockResolvedValue(mockError)
    const api = minswapApiMaker(mockConfig)

    const result = await api.tokens()

    expect(result).toEqual(mockError)
  })

  it('should handle network errors', async () => {
    mockConfig.request = jest.fn().mockRejectedValue(new Error('Network error'))
    const api = minswapApiMaker(mockConfig)

    const result = await api.tokens()

    expect(result.tag).toBe('left')
    if (result.tag === 'left') {
      expect(result.error.status).toBe(-1)
      expect(result.error.message).toBe('Network error')
    }
  })
})

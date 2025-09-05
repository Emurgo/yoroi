import {isRight} from '@yoroi/common'
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
                token_id: 'test-token',
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
})

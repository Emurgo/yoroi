import {Portfolio} from '@yoroi/types'

import {transformersMaker} from './transformers'

const mockConfig = {
  address: 'addr1test',
  network: 'mainnet' as any,
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
}

describe('transformersMaker', () => {
  const transformers = transformersMaker(mockConfig)

  describe('tokens', () => {
    it('should transform tokens response correctly', () => {
      const mockResponse = {
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
          {
            asset: {
              token_id: 'test-token-id',
              logo: 'https://example.com/logo.png',
              ticker: 'TEST',
              is_verified: false,
              price_by_ada: 0.1,
              project_name: 'Test Token',
              decimals: 6,
            },
          },
        ],
        total: 2,
        page: 1,
        limit: 1000,
      }

      const result = transformers.tokens.response(mockResponse)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'lovelace' as `${string}.${string}`,
        name: 'Cardano',
        ticker: 'ADA',
        decimals: 6,
        logo: null,
        description: null,
        website: null,
        policyId: '',
        fingerprint: null,
        group: 'ADA',
        kind: 'ft',
        image: null,
        icon: null,
        symbol: 'ADA',
        metadatas: {},
        isPrimaryToken: true,
      })
      expect(result[1]).toEqual({
        id: 'test-token-id',
        name: 'Test Token',
        ticker: 'TEST',
        decimals: 6,
        logo: 'https://example.com/logo.png',
        description: null,
        website: null,
        policyId: 'test-token-id',
        fingerprint: null,
        group: null,
        kind: 'ft',
        image: 'https://example.com/logo.png',
        icon: 'https://example.com/logo.png',
        symbol: 'TEST',
        metadatas: {},
        isPrimaryToken: false,
      })
    })
  })

  describe('orders', () => {
    it('should transform orders response correctly', () => {
      const mockResponse = {
        orders: [
          {
            owner_address: 'addr1test',
            protocol: 'MinswapV2' as any,
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
            created_at: 1234567890,
            tx_in: 'txhash#0',
            dex_fee: '1',
            deposit: '2',
          },
        ],
        amount_in_decimal: true,
      }

      const result = transformers.orders.response(mockResponse)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        txHash: 'txhash',
        outputIndex: 0,
        fromToken: 'lovelace',
        toToken: 'test-token',
        fromAmount: '100',
        toAmount: '1000',
        paidAmount: '100',
        receivedAmount: '1000',
        batcherFee: '1',
        attachedValues: [],
        sender: 'addr1test',
        beneficiary: 'addr1test',
        deposit: '2',
        status: 'open',
        placedAt: 1234567890,
        finalizedAt: null,
        finalizedTxHash: null,
        providerSpecifics: {
          protocol: 'MinswapV2',
          poolId: null,
        },
        aggregator: 'minswap',
      })
    })
  })

  describe('estimate', () => {
    it('should transform estimate response correctly', () => {
      const mockResponse = {
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
        amount_out: '1000',
        price_impact: 0.01,
        minimum_received: '990',
        fee: '1',
        route: [
          {
            pool: {
              pool_id: 'pool123',
              fee: 0.003,
              token_a: {
                token_id: 'lovelace',
                logo: null,
                ticker: 'ADA',
                is_verified: true,
                price_by_ada: 1,
                project_name: 'Cardano',
                decimals: 6,
              },
              token_b: {
                token_id: 'test-token',
                logo: null,
                ticker: 'TEST',
                is_verified: true,
                price_by_ada: 0.1,
                project_name: 'Test Token',
                decimals: 6,
              },
            },
            amount_in: '100',
            amount_out: '1000',
          },
        ],
        aggregator: 'Minswap' as any,
      }

      const result = transformers.estimate.response(mockResponse)

      expect(result.splits).toEqual([])
      expect(result.batcherFee).toBe(1)
      expect(result.netPrice).toBe(10)
      expect(result.priceImpact).toBe(0.01)
    })
  })
})

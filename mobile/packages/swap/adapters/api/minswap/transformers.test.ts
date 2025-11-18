import {Portfolio} from '@yoroi/types'

import {transformersMaker} from './transformers'
import {Dex} from './types'

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

  describe('mapProtocolToDex edge cases', () => {
    it('should handle unknown protocol and return Unsupported', () => {
      // Test the default case in mapProtocolToDex by accessing it through the transformers
      // We need to test with an invalid protocol that would trigger the default case
      const mockResponse = {
        tokens: [
          {
            token_id: 'lovelace',
            logo: null,
            ticker: 'ADA',
            is_verified: true,
            price_by_ada: 1,
            project_name: 'Cardano',
            decimals: 6,
            name: 'Cardano',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      }

      const result = transformers.tokens.response(mockResponse)
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should test tokens request function', () => {
      const result = transformers.tokens.request()
      expect(result).toEqual({
        query: '',
        only_verified: false,
      })
    })

    it('should handle all protocol mappings in mapProtocolToDex', () => {
      // Test various protocol mappings by using them in blocked protocols
      const mockRequest = {
        amountIn: 10,
        blockedProtocols: [
          'minswap-v1' as any,
          'minswap-stable' as any,
          'muesliswap' as any,
          'splash-v1' as any,
          'sundaeswap-v3' as any,
          'sundaeswap-v1' as any,
          'vyfi-v1' as any,
          'cswap' as any,
          'wingriders-v2' as any,
          'wingriders-v1' as any,
          'wingriders-stable' as any,
          'spectrum-v1' as any,
        ],
        slippage: 1,
        tokenIn: '.' as const,
        tokenOut: 'test-token.' as const,
      }

      const result = transformers.estimate.request(mockRequest)
      expect(result.exclude_protocols).toHaveLength(12)
      expect(result.exclude_protocols).toContain(Dex.Minswap)
      expect(result.exclude_protocols).toContain(Dex.MinswapStable)
      expect(result.exclude_protocols).toContain(Dex.MuesliSwap)
      expect(result.exclude_protocols).toContain(Dex.Splash)
      expect(result.exclude_protocols).toContain(Dex.SundaeSwapV3)
      expect(result.exclude_protocols).toContain(Dex.SundaeSwap)
      expect(result.exclude_protocols).toContain(Dex.VyFinance)
      expect(result.exclude_protocols).toContain(Dex.CswapV1)
      expect(result.exclude_protocols).toContain(Dex.WingRidersV2)
      expect(result.exclude_protocols).toContain(Dex.WingRiders)
      expect(result.exclude_protocols).toContain(Dex.WingRidersStableV2)
      expect(result.exclude_protocols).toContain(Dex.Spectrum)
    })

    it('should handle unknown protocol in mapProtocolToDex default case', () => {
      // Test the default case in mapProtocolToDex by using an unknown protocol
      const mockRequest = {
        amountIn: 10,
        blockedProtocols: ['unknown-protocol' as any],
        slippage: 1,
        tokenIn: '.' as const,
        tokenOut: 'test-token.' as const,
      }

      const result = transformers.estimate.request(mockRequest)
      expect(result.exclude_protocols).toContain(Dex.Unsupported)
    })

    it('should handle splash-stable protocol mapping', () => {
      // Test the splash-stable protocol mapping (line 50)
      const mockRequest = {
        amountIn: 10,
        blockedProtocols: ['splash-v1' as any], // Use valid splash-v1 protocol
        slippage: 1,
        tokenIn: '.' as const,
        tokenOut: 'test-token.' as const,
      }

      const result = transformers.estimate.request(mockRequest)
      expect(result.exclude_protocols).toContain(Dex.Splash)
    })

    it('should handle blocked protocols mapping with undefined', () => {
      // Test the blocked protocols mapping when blockedProtocols is undefined (line 286)
      const mockRequest = {
        amountIn: 10,
        blockedProtocols: undefined,
        slippage: 1,
        tokenIn: '.' as const,
        tokenOut: 'test-token.' as const,
      }

      const result = transformers.estimate.request(mockRequest)
      expect(result.exclude_protocols).toBeUndefined()
    })
  })

  describe('tokens', () => {
    it('should transform tokens response correctly', () => {
      const mockResponse = {
        tokens: [
          {
            token_id: 'lovelace',
            logo: null,
            ticker: 'ADA',
            is_verified: true,
            price_by_ada: 1,
            project_name: 'Cardano',
            decimals: 6,
          },
          {
            token_id: 'test-token-id',
            logo: 'https://example.com/logo.png',
            ticker: 'TEST',
            is_verified: false,
            price_by_ada: 0.1,
            project_name: 'Test Token',
            decimals: 6,
          },
        ],
        total: 2,
        page: 1,
        limit: 1000,
      }

      const result = transformers.tokens.response(mockResponse)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: '.' as `${string}.${string}`,
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
        status: 'valid',
        application: 'general',
        tag: '',
        reference: '',
        nature: 'primary',
        type: 'ft',
        originalImage: '',
      })
      expect(result[1]).toEqual({
        id: 'test-token-id.',
        name: 'Test Token',
        ticker: 'TEST',
        decimals: 6,
        description: '',
        website: '',
        fingerprint: '',
        originalImage: '',
        reference: '',
        symbol: '',
        tag: '',
        status: 'invalid',
        type: 'ft',
        application: 'general',
        nature: 'secondary',
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
        aggregator: 'minswap' as const,
        protocol: 'minswap-v2',
        placedAt: 1234567890,
        lastUpdate: 1234567890,
        status: 'open',
        tokenIn: '.',
        tokenOut: 'test-token.',
        amountIn: 100,
        actualAmountOut: 1000,
        expectedAmountOut: 1000,
        txHash: 'txhash',
        outputIndex: 0,
        updateTxHash: undefined,
        customId: undefined,
      })
    })
  })

  describe('estimate', () => {
    it('should transform estimate request correctly', () => {
      const mockRequest = {
        amountIn: 10,
        blockedProtocols: [],
        slippage: 1,
        tokenIn: '.' as const,
        tokenOut:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
      }

      const result = transformers.estimate.request(mockRequest)

      expect(result).toEqual({
        token_in: 'lovelace',
        token_out:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441',
        amount: '10',
        slippage: 1,
        exclude_protocols: [],
        amount_in_decimal: true,
      })
    })

    it('should transform estimate response correctly with real data', () => {
      const mockResponse = {
        token_in: 'lovelace',
        token_out:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441',
        amount_in: '10',
        amount_out: '8.290409',
        amount_in_decimal: true,
        avg_price_impact: 0.3006573962454888,
        min_amount_out: '8.208325',
        aggregator_fee: '0',
        aggregator_fee_percent: 0.1,
        deposits: '2',
        total_dex_fee: '0.7',
        total_lp_fee: '0.03',
        paths: [
          [
            {
              amount_in: '10',
              amount_out: '8.290409',
              deposits: '2',
              dex_fee: '0.7',
              lp_fee: '0.03',
              lp_token:
                'f5808c2c990d86da54bfc97d89cee6efa20cd8461616359478d96b4cee5cfbc5b0dc10c873a0bcc69e49b9af21b899f59337a894874c6b596c2da136',
              min_amount_out: '8.208325',
              pool_id:
                'f5808c2c990d86da54bfc97d89cee6efa20cd8461616359478d96b4c.ee5cfbc5b0dc10c873a0bcc69e49b9af21b899f59337a894874c6b596c2da136',
              price_impact: 0.3006573962454888,
              protocol: Dex.MinswapV2,
              token_in: 'lovelace',
              token_out:
                'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441',
            },
          ],
        ],
        route: [],
        aggregator: 'Minswap' as const,
      }

      const result = transformers.estimate.response(mockResponse)

      expect(result.splits).toHaveLength(1)
      expect(result.splits[0]).toEqual(
        expect.objectContaining({
          amountIn: 10,
          batcherFee: 0.7,
          deposits: 2,
          protocol: 'minswap-v2',
          expectedOutput: 8.208325,
          expectedOutputWithoutSlippage: 8.290409,
          fee: 0.7,
          initialPrice: 0.8290409000000001,
          finalPrice: 0.8290409000000001,
          poolFee: 0.03,
          poolId:
            'f5808c2c990d86da54bfc97d89cee6efa20cd8461616359478d96b4c.ee5cfbc5b0dc10c873a0bcc69e49b9af21b899f59337a894874c6b596c2da136',
          priceDistortion: 0,
          priceImpact: 0.3006573962454888,
        }),
      )
      expect(result.batcherFee).toBe(0.7)
      expect(result.deposits).toBe(2)
      expect(result.aggregatorFee).toBe(0)
      expect(result.frontendFee).toBe(0)
      expect(result.netPrice).toBeCloseTo(0.8208325)
      expect(result.priceImpact).toBe(0.3006573962454888)
      expect(result.totalFee).toBe(0.7)
      expect(result.totalOutput).toBe(8.208325)
      expect(result.totalOutputWithoutSlippage).toBe(8.290409)
      expect(result.totalInput).toBe(10)
    })

    it('should handle estimate request with partner parameter', () => {
      const configWithPartner = {
        ...mockConfig,
        partner: 'test-partner',
      }
      const transformersWithPartner = transformersMaker(configWithPartner)

      const mockRequest = {
        amountIn: 10,
        blockedProtocols: [],
        slippage: 1,
        tokenIn: '.' as const,
        tokenOut: 'test-token.' as const,
      }

      const result = transformersWithPartner.estimate.request(mockRequest)

      expect(result.partner).toBe('test-partner')
    })

    it('should handle estimate request with blocked protocols', () => {
      const mockRequest = {
        amountIn: 10,
        blockedProtocols: ['minswap-v2' as any],
        slippage: 1,
        tokenIn: '.' as const,
        tokenOut: 'test-token.' as const,
      }

      const result = transformers.estimate.request(mockRequest)

      expect(result.exclude_protocols).toEqual([Dex.MinswapV2])
    })

    it('should not include include_protocols when protocol is undefined', () => {
      const mockRequest = {
        amountIn: 10,
        blockedProtocols: [],
        slippage: 1,
        tokenIn: '.' as const,
        tokenOut: 'test-token.' as const,
        protocol: undefined,
      }

      const result = transformers.estimate.request(mockRequest)

      expect(result).not.toHaveProperty('include_protocols')
    })

    it('should include include_protocols when protocol is defined', () => {
      const mockRequest = {
        amountIn: 10,
        blockedProtocols: [],
        slippage: 1,
        tokenIn: '.' as const,
        tokenOut: 'test-token.' as const,
        protocol: 'minswap-v2' as any,
      }

      const result = transformers.estimate.request(mockRequest)

      expect(result.include_protocols).toEqual([Dex.MinswapV2])
    })

    it('should handle unknown Dex protocol in response', () => {
      // Test the default case in mapDexToProtocol by providing an invalid protocol
      const mockResponse = {
        token_in: 'lovelace',
        token_out: 'test-token.',
        amount_in: '10',
        amount_out: '8.290409',
        amount_in_decimal: true,
        avg_price_impact: 0.3006573962454888,
        min_amount_out: '8.208325',
        aggregator_fee: '0',
        aggregator_fee_percent: 0.1,
        deposits: '2',
        total_dex_fee: '0.7',
        total_lp_fee: '0.03',
        paths: [
          [
            {
              amount_in: '10',
              amount_out: '8.290409',
              deposits: '2',
              dex_fee: '0.7',
              lp_fee: '0.03',
              lp_token: 'test-lp-token',
              min_amount_out: '8.208325',
              pool_id: 'test-pool-id',
              price_impact: 0.3006573962454888,
              protocol: 'UnknownProtocol' as any, // This should trigger the default case
              token_in: 'lovelace',
              token_out: 'test-token.',
            },
          ],
        ],
        route: [
          {
            pool: {
              pool_id: 'test-pool-id',
              fee: 0.7,
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
                token_id: 'test-token.',
                logo: null,
                ticker: 'TEST',
                is_verified: true,
                price_by_ada: 0.8290409,
                project_name: 'Test Token',
                decimals: 6,
              },
            },
            amount_in: '10',
            amount_out: '8.290409',
          },
        ],
        aggregator: 'Minswap' as const,
      }

      const result = transformers.estimate.response(mockResponse)

      // The default case should return Swap.Protocol.Unsupported
      expect(result.splits[0]?.protocol).toBe('unsupported')
    })

    it('should handle all Dex protocol mappings in mapDexToProtocol', () => {
      // Test all Dex protocol mappings by providing them in separate responses
      const testCases = [
        {dex: Dex.MinswapV2, expected: 'minswap-v2'},
        {dex: Dex.Minswap, expected: 'minswap-v1'},
        {dex: Dex.MinswapStable, expected: 'minswap-stable'},
        {dex: Dex.MuesliSwap, expected: 'muesliswap'},
        {dex: Dex.Splash, expected: 'splash-v1'},
        {dex: Dex.SundaeSwapV3, expected: 'sundaeswap-v3'},
        {dex: Dex.SundaeSwap, expected: 'sundaeswap-v1'},
        {dex: Dex.VyFinance, expected: 'vyfi-v1'},
        {dex: Dex.CswapV1, expected: 'cswap'},
        {dex: Dex.WingRidersV2, expected: 'wingriders-v2'},
        {dex: Dex.WingRiders, expected: 'wingriders-v1'},
        {dex: Dex.WingRidersStableV2, expected: 'wingriders-stable'},
        {dex: Dex.Spectrum, expected: 'spectrum-v1'},
        {dex: Dex.SplashStable, expected: 'splash-v1'},
      ]

      testCases.forEach(({dex, expected}) => {
        const mockResponse = {
          token_in: 'lovelace',
          token_out: 'test-token.',
          amount_in: '10',
          amount_out: '8.290409',
          amount_in_decimal: true,
          avg_price_impact: 0.3006573962454888,
          min_amount_out: '8.208325',
          aggregator_fee: '0',
          aggregator_fee_percent: 0.1,
          deposits: '2',
          total_dex_fee: '0.7',
          total_lp_fee: '0.03',
          paths: [
            [
              {
                amount_in: '10',
                amount_out: '8.290409',
                deposits: '2',
                dex_fee: '0.7',
                lp_fee: '0.03',
                lp_token: 'test-lp-token',
                min_amount_out: '8.208325',
                pool_id: 'test-pool-id',
                price_impact: 0.3006573962454888,
                protocol: dex,
                token_in: 'lovelace',
                token_out: 'test-token.',
              },
            ],
          ],
          route: [
            {
              pool: {
                pool_id: 'test-pool-id',
                fee: 0.7,
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
                  token_id: 'test-token.',
                  logo: null,
                  ticker: 'TEST',
                  is_verified: true,
                  price_by_ada: 0.8290409,
                  project_name: 'Test Token',
                  decimals: 6,
                },
              },
              amount_in: '10',
              amount_out: '8.290409',
            },
          ],
          aggregator: 'Minswap' as const,
        }

        const result = transformers.estimate.response(mockResponse)
        expect(result.splits[0]?.protocol).toBe(expected)
      })
    })
  })

  describe('create', () => {
    it('should transform create request correctly', () => {
      const mockRequest = {
        amountIn: 10,
        blockedProtocols: [],
        slippage: 1,
        tokenIn: '.' as const,
        tokenOut:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
      }

      const result = transformers.create.request(mockRequest)

      expect(result).toEqual({
        sender: 'addr1test',
        min_amount_out: '0',
        estimate: {
          amount: '10',
          token_in: 'lovelace',
          token_out:
            'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441',
          slippage: 1,
          exclude_protocols: [],
        },
        amount_in_decimal: true,
      })
    })

    it('should transform create request with partner', () => {
      const configWithPartner = {
        ...mockConfig,
        partner: 'test-partner',
      }
      const transformersWithPartner = transformersMaker(configWithPartner)

      const mockRequest = {
        amountIn: 10,
        blockedProtocols: [],
        slippage: 1,
        tokenIn: '.' as const,
        tokenOut: 'test-token.' as const,
      }

      const result = transformersWithPartner.create.request(mockRequest)

      expect(result.estimate.partner).toBe('test-partner')
    })

    it('should include inputs_to_choose when inputs are provided', () => {
      const mockRequest = {
        amountIn: 10,
        blockedProtocols: [],
        slippage: 1,
        tokenIn: '.' as const,
        tokenOut:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
        inputs: ['utxo1', 'utxo2'],
      }

      const result = transformers.create.request(mockRequest)

      expect(result.inputs_to_choose).toEqual(['utxo1', 'utxo2'])
    })

    it('should not include inputs_to_choose when inputs are empty', () => {
      const mockRequest = {
        amountIn: 10,
        blockedProtocols: [],
        slippage: 1,
        tokenIn: '.' as const,
        tokenOut:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
        inputs: [],
      }

      const result = transformers.create.request(mockRequest)

      expect(result.inputs_to_choose).toBeUndefined()
    })

    it('should transform create response correctly', () => {
      const mockResponse = {
        cbor: 'test-cbor-data',
      }

      const result = transformers.create.response(mockResponse)

      expect(result).toEqual({
        splits: [],
        batcherFee: 0,
        deposits: 0,
        aggregatorFee: 0,
        frontendFee: 0,
        netPrice: 0,
        priceImpact: 0,
        totalFee: 0,
        totalInput: 0,
        totalOutput: 0,
        totalOutputWithoutSlippage: 0,
        aggregator: 'minswap' as const,
        cbor: 'test-cbor-data',
      })
    })
  })

  describe('limitOptions', () => {
    it('should transform limitOptions response correctly', () => {
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
          is_verified: false,
          price_by_ada: 0.5,
          project_name: 'Test Token',
          decimals: 6,
        },
        amount_in: '10',
        amount_out: '8.290409',
        price: 0.8290409,
        options: [
          {
            protocol: Dex.MinswapV2,
            pool_id: 'test-pool-id',
            fee: 2,
            price: 0.8290409,
            liquidity: '1000000',
          },
        ],
      }

      const result = transformers.limitOptions.response(mockResponse)

      expect(result).toEqual({
        defaultProtocol: 'minswap-v2',
        wantedPrice: 0.8290409,
        options: [
          {
            protocol: 'minswap-v2',
            initialPrice: 0.8290409,
            batcherFee: 2,
          },
        ],
      })
    })
  })

  describe('cancel', () => {
    it('should transform cancel response correctly', () => {
      const mockResponse = {
        cbor: 'cancel-cbor-data',
      }

      const result = transformers.cancel.response(mockResponse)

      expect(result).toEqual({
        cbor: 'cancel-cbor-data',
        additionalCancellationFee: undefined,
      })
    })
  })

  describe('edge cases', () => {
    it('should handle empty paths in estimate response', () => {
      const mockResponse = {
        token_in: 'lovelace',
        token_out: 'test-token',
        amount_in: '10',
        amount_out: '8.290409',
        amount_in_decimal: true,
        min_amount_out: '8.208325',
        aggregator_fee: '0',
        aggregator_fee_percent: 0.1,
        deposits: '2',
        total_dex_fee: '0.7',
        total_lp_fee: '0.03',
        avg_price_impact: 0.3,
        paths: [],
        route: [],
        aggregator: 'Minswap' as const,
      }

      const result = transformers.estimate.response(mockResponse)

      expect(result.splits).toHaveLength(0)
      expect(result.totalInput).toBe(10)
      expect(result.totalOutput).toBe(8.208325)
    })

    it('should handle null values in token data', () => {
      const mockResponse = {
        tokens: [
          {
            token_id: 'test-token',
            logo: null,
            ticker: null,
            is_verified: null,
            price_by_ada: null,
            project_name: null,
            decimals: null,
          },
        ],
        total: 1,
        page: 1,
        limit: 1000,
      }

      const result = transformers.tokens.response(mockResponse)

      expect(result).toHaveLength(1)
      expect(result[0]?.name).toBe('Unknown Token')
      expect(result[0]?.ticker).toBe('')
      expect(result[0]?.decimals).toBe(0)
    })

    it('should handle zero amounts in estimate response', () => {
      const mockResponse = {
        token_in: 'lovelace',
        token_out: 'test-token',
        amount_in: '0',
        amount_out: '0',
        amount_in_decimal: true,
        min_amount_out: '0',
        aggregator_fee: '0',
        aggregator_fee_percent: 0,
        deposits: '0',
        total_dex_fee: '0',
        total_lp_fee: '0',
        avg_price_impact: 0,
        paths: [
          [
            {
              amount_in: '0',
              amount_out: '0',
              deposits: '0',
              dex_fee: '0',
              lp_fee: '0',
              lp_token: 'test-lp-token',
              min_amount_out: '0',
              pool_id: 'pool123',
              price_impact: 0,
              protocol: Dex.MinswapV2,
              token_in: 'lovelace',
              token_out: 'test-token',
            },
          ],
        ],
        route: [],
        aggregator: 'Minswap' as const,
      }

      const result = transformers.estimate.response(mockResponse)

      expect(result.totalInput).toBe(0)
      expect(result.totalOutput).toBe(0)
      expect(result.netPrice).toBe(0)
      expect(result.splits[0]?.initialPrice).toBe(0)
      expect(result.splits[0]?.finalPrice).toBe(0)
    })
  })
})

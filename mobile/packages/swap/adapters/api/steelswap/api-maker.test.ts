import {isLeft, isRight} from '@yoroi/common'
import {Chain, Portfolio} from '@yoroi/types'

import {steelswapApiMaker} from './api-maker'
import {
  BuildSwapResponse,
  CancelResponse,
  EstimateResponse,
  OrderStatusResponse,
  TokensResponse,
} from './types'

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

describe('steelswapApiMaker', () => {
  const mockTokensResponse: TokensResponse = [
    {
      ticker: 'USDA',
      name: 'USDA',
      policyId: 'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456',
      policyName: '55534441',
      decimals: 6,
    },
  ]

  const mockTokensApiResponse = {
    tag: 'right' as const,
    value: {
      status: 200,
      data: mockTokensResponse,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return proxy for non-mainnet networks', async () => {
    const config = {
      ...mockConfig,
      network: Chain.Network.Preprod as Chain.SupportedNetworks,
    }
    const api = steelswapApiMaker(config)

    const result = await api.tokens()
    expect(isLeft(result)).toBe(true)
    if (isLeft(result)) {
      expect(result.error).toMatchObject({
        status: -3,
        message: 'Steelswap api only works on mainnet',
      })
    }
  })

  it('should create API instance for mainnet', () => {
    const api = steelswapApiMaker(mockConfig)

    expect(api).toBeDefined()
    expect(typeof api.tokens).toBe('function')
    expect(typeof api.orders).toBe('function')
    expect(typeof api.estimate).toBe('function')
    expect(typeof api.create).toBe('function')
    expect(typeof api.cancel).toBe('function')
  })

  describe('tokens', () => {
    it('should handle tokens request successfully', async () => {
      const mockResponse: TokensResponse = [
        {
          ticker: 'USDA',
          name: 'USDA',
          policyId: 'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456',
          policyName: '55534441',
          decimals: 6,
        },
      ]

      mockConfig.request = jest.fn().mockResolvedValue({
        tag: 'right' as const,
        value: {
          status: 200,
          data: mockResponse,
        },
      })

      const api = steelswapApiMaker(mockConfig)
      const result = await api.tokens()

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data).toHaveLength(1)
        expect(result.value.data[0]).toMatchObject({
          ticker: 'USDA',
          decimals: 6,
        })
      }
    })

    it('should handle tokens request error', async () => {
      mockConfig.request = jest.fn().mockResolvedValue({
        tag: 'left' as const,
        error: {
          status: 500,
          message: 'Internal Server Error',
          responseData: null,
        },
      })

      const api = steelswapApiMaker(mockConfig)
      const result = await api.tokens()

      expect(isLeft(result)).toBe(true)
    })
  })

  describe('orders', () => {
    it('should handle orders request successfully', async () => {
      const mockResponse: OrderStatusResponse = {
        orders: [
          {
            source: 'MuesliSwap',
            firstObserved: 1762266077000,
            lastUpdated: 1762266077000,
            totalSubmitted: {lovelace: 13200000},
            totalRequested: {
              fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441: 15000000,
            },
            totalReceived: {},
            swaps: [
              {
                dex: 'MinswapV2',
                orderType: 0,
                txStatus: 'queued',
                submitTxHash:
                  '0788552a7f0bfe547d47be51e36f579cda23b4adfccefeb7f74ea90e395c8bd2',
                submitTxIndex: 0,
                submitTime: 1762266077000,
                submitAssets: [{lovelace: 13200000}],
                requestAssets: [
                  {
                    fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441: 15000000,
                  },
                ],
                executeTxHash: null,
                executeTxIndex: null,
                executeTime: null,
                receivedAssets: null,
              },
            ],
          },
        ],
        page: 0,
        lastPage: 0,
      }

      mockConfig.request = jest.fn().mockResolvedValue({
        tag: 'right' as const,
        value: {
          status: 200,
          data: mockResponse,
        },
      })

      const api = steelswapApiMaker(mockConfig)
      const result = await api.orders()

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data).toHaveLength(1)
        expect(result.value.data[0]).toMatchObject({
          txHash:
            '0788552a7f0bfe547d47be51e36f579cda23b4adfccefeb7f74ea90e395c8bd2',
          status: 'open',
        })
      }
    })
  })

  describe('estimate', () => {
    it('should handle estimate request successfully', async () => {
      const mockResponse: EstimateResponse = {
        tokenA: 'lovelace',
        quantityA: 2000000, // Already in decimal format (isFloat=true)
        tokenB:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441',
        quantityB: 1089627, // Already in decimal format (isFloat=true)
        totalFee: 0.1, // Already in ADA (isFloat=true)
        totalDeposit: 0,
        steelswapFee: 0,
        bonusOut: 0,
        price: 1.9311019603443615,
        splitGroup: [
          [
            {
              tokenA: 'lovelace',
              quantityA: 2000000, // Already in decimal format (isFloat=true)
              tokenB:
                'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441',
              quantityB: 1089627, // Already in decimal format (isFloat=true)
              totalFee: 0.1, // Already in ADA (isFloat=true)
              totalDeposit: 0,
              steelswapFee: 0,
              bonusOut: 0,
              price: 1.9311019603443615,
              pools: [
                {
                  dex: 'Splash',
                  poolId: 'test-pool-id',
                  quantityA: 2000000, // Already in decimal format (isFloat=true)
                  quantityB: 1089627, // Already in decimal format (isFloat=true)
                  batcherFee: 0.1, // Already in ADA (isFloat=true)
                  deposit: 0,
                  volumeFee: 1000, // Still in lovelace, will be converted
                },
              ],
            },
          ],
        ],
      }

      mockConfig.request = jest.fn().mockResolvedValue({
        tag: 'right' as const,
        value: {
          status: 200,
          data: mockResponse,
        },
      })

      const api = steelswapApiMaker(mockConfig)
      const result = await api.estimate({
        tokenIn: '.' as const,
        tokenOut:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
        amountIn: 2, // 2 ADA in decimal
        slippage: 0.5,
      })

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data.totalInput).toBe(2000000) // Already in decimal format (isFloat=true)
        expect(result.value.data.totalOutput).toBe(1089627) // Already in decimal format (isFloat=true)
      }
    })

    it('should handle estimate error', async () => {
      mockConfig.request = jest
        .fn()
        .mockResolvedValueOnce(mockTokensApiResponse)
        .mockResolvedValueOnce({
          tag: 'left' as const,
          error: {
            status: 422,
            message: 'Validation Error',
            responseData: {
              detail: 'Invalid token pair',
            },
          },
        })

      const api = steelswapApiMaker(mockConfig)
      const result = await api.estimate({
        tokenIn: '.' as const,
        tokenOut: 'invalid.invalid' as const,
        amountIn: 1000000,
        slippage: 0.5,
      })

      expect(isLeft(result)).toBe(true)
    })

    it('should reject limit estimates (wantedPrice)', async () => {
      const api = steelswapApiMaker(mockConfig)
      const result = await api.estimate({
        tokenIn: '.' as const,
        tokenOut:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
        amountIn: 2,
        slippage: 0.5,
        wantedPrice: 1.5, // Limit estimate - should be rejected
      })

      expect(isLeft(result)).toBe(true)
      if (isLeft(result)) {
        expect(result.error.message).toBe(
          'Steelswap Aggregator only supports market',
        )
        expect(result.error.status).toBe(-1)
      }
    })

    it('should handle estimate response with invalid structure', async () => {
      const mockResponse = {
        splitGroup: [[]],
      }

      mockConfig.request = jest
        .fn()
        .mockResolvedValueOnce(mockTokensApiResponse)
        .mockResolvedValueOnce({
          tag: 'right' as const,
          value: {
            status: 200,
            data: mockResponse,
          },
        })

      const api = steelswapApiMaker(mockConfig)
      const result = await api.estimate({
        tokenIn: '.' as const,
        tokenOut: '.' as const,
        amountIn: 1000000,
        slippage: 0.5,
      })

      expect(isLeft(result)).toBe(true)
      if (isLeft(result)) {
        expect(result.error.message).toContain('No liquidity pools')
      }
    })
  })

  describe('create', () => {
    it('should handle create request successfully', async () => {
      const buildResponse: BuildSwapResponse = {
        tx: 'test-cbor-hex',
        p: false,
      }

      const estimateResponse: EstimateResponse = {
        tokenA: 'lovelace',
        quantityA: 2000000, // Already in decimal format (isFloat=true)
        tokenB:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441',
        quantityB: 1089627, // Already in decimal format (isFloat=true)
        totalFee: 0.1, // Already in ADA (isFloat=true)
        totalDeposit: 0,
        steelswapFee: 0,
        bonusOut: 0,
        price: 1.9311019603443615,
        splitGroup: [
          [
            {
              tokenA: 'lovelace',
              quantityA: 2000000, // Already in decimal format (isFloat=true)
              tokenB:
                'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441',
              quantityB: 1089627, // Already in decimal format (isFloat=true)
              totalFee: 0.1, // Already in ADA (isFloat=true)
              totalDeposit: 0,
              steelswapFee: 0,
              bonusOut: 0,
              price: 1.9311019603443615,
              pools: [
                {
                  dex: 'Splash',
                  poolId: 'test-pool-id',
                  quantityA: 2000000, // Already in decimal format (isFloat=true)
                  quantityB: 1089627, // Already in decimal format (isFloat=true)
                  batcherFee: 0.1, // Already in ADA (isFloat=true)
                  deposit: 0,
                  volumeFee: 1000, // Still in lovelace, will be converted
                },
              ],
            },
          ],
        ],
      }

      // Mock build request and estimate request (called internally)
      mockConfig.request = jest
        .fn()
        .mockResolvedValueOnce({
          tag: 'right' as const,
          value: {
            status: 200,
            data: buildResponse,
          },
        })
        .mockResolvedValueOnce({
          tag: 'right' as const,
          value: {
            status: 200,
            data: estimateResponse,
          },
        })

      const api = steelswapApiMaker(mockConfig)
      const result = await api.create({
        tokenIn: '.' as const,
        tokenOut:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
        amountIn: 2, // 2 ADA in decimal
        slippage: 0.5,
        inputs: ['test-utxo'],
      })

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data.cbor).toBe('test-cbor-hex')
        expect(result.value.data.totalInput).toBe(2000000) // Already in decimal format (isFloat=true)
        expect(result.value.data.totalOutput).toBe(1089627) // Already in decimal format (isFloat=true)
        expect(result.value.data.totalFee).toBe(0.1) // 0.1 (batcher) + 0 (steelswap) = 0.1 ADA (already converted)
      }
    })

    it('should handle create request when estimate fails', async () => {
      const buildResponse: BuildSwapResponse = {
        tx: 'test-cbor-hex',
        p: false,
      }

      mockConfig.request = jest
        .fn()
        .mockResolvedValueOnce({
          tag: 'right' as const,
          value: {
            status: 200,
            data: buildResponse,
          },
        })
        .mockResolvedValueOnce({
          tag: 'left' as const,
          error: {
            status: 500,
            message: 'Estimate failed',
            responseData: null,
          },
        })

      const api = steelswapApiMaker(mockConfig)
      const result = await api.create({
        tokenIn: '.' as const,
        tokenOut: '.' as const,
        amountIn: 2000000,
        slippage: 0.5,
        inputs: [],
      })

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data.cbor).toBe('test-cbor-hex')
        // Should have minimal data when estimate fails
        expect(result.value.data.totalInput).toBe(0)
      }
    })
  })

  describe('cancel', () => {
    it('should handle cancel request successfully', async () => {
      const mockResponse: CancelResponse = 'test-cancel-cbor-hex'

      mockConfig.request = jest.fn().mockResolvedValue({
        tag: 'right' as const,
        value: {
          status: 200,
          data: mockResponse,
        },
      })

      const api = steelswapApiMaker(mockConfig)
      const result = await api.cancel({
        order: {
          aggregator: 'steelswap' as any,
          protocol: 'minswap-v2' as any,
          status: 'open',
          tokenIn: '.' as const,
          tokenOut: '.' as const,
          amountIn: 1000000,
          expectedAmountOut: 2000000,
          actualAmountOut: 2000000,
          txHash: 'test-tx-hash',
          outputIndex: 0,
        },
      })

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data.cbor).toBe('test-cancel-cbor-hex')
      }
    })
  })
})

import {Chain, Portfolio, Swap} from '@yoroi/types'

import {transformersMaker} from './transformers'
import {
  BuildSwapResponse,
  CancelResponse,
  OrderStatusResponse,
  SplitOutput,
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
  partner: 'yoroi-aggregator',
}

describe('transformersMaker', () => {
  const transformers = transformersMaker(mockConfig)

  describe('tokens', () => {
    it('should transform tokens response correctly', () => {
      const mockResponse: TokensResponse = [
        {
          ticker: 'ADA',
          name: 'Cardano',
          policyId: 'lovelace',
          policyName: '',
          decimals: 6,
        },
        {
          ticker: 'USDA',
          name: 'USDA',
          policyId: 'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456',
          policyName: '55534441',
          decimals: 6,
        },
      ]

      const result = transformers.tokens.response(mockResponse)

      expect(result).toHaveLength(1) // Primary token is filtered out
      expect(result[0]).toMatchObject({
        id: 'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441',
        ticker: 'USDA',
        name: 'USDA',
        decimals: 6,
        status: Portfolio.Token.Status.Valid,
      })
    })

    it('should filter out tokens with null decimals', () => {
      const mockResponse: TokensResponse = [
        {
          ticker: 'TEST',
          name: 'Test Token',
          policyId: 'test123',
          policyName: 'TEST',
          decimals: null as any,
        },
      ]

      const result = transformers.tokens.response(mockResponse)
      expect(result).toHaveLength(0)
    })
  })

  describe('orders', () => {
    it('should transform orders response correctly', () => {
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
        page: 1,
        lastPage: 1,
      }

      const result = transformers.orders.response(mockResponse)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        status: 'open',
        txHash:
          '0788552a7f0bfe547d47be51e36f579cda23b4adfccefeb7f74ea90e395c8bd2',
        outputIndex: 0,
        tokenIn: '.',
        tokenOut:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441',
        amountIn: 13200000, // Already in decimal format (isFloat=true)
        expectedAmountOut: 15000000, // Already in decimal format (isFloat=true)
        actualAmountOut: 15000000, // Already in decimal format (isFloat=true)
        aggregator: Swap.Aggregator.Steelswap,
        protocol: Swap.Protocol.Minswap_v2,
      })
    })

    it('should map txStatus correctly', () => {
      const statusMap: Record<string, Swap.Order['status']> = {
        txPending: 'open',
        queued: 'open',
        executed: 'matched',
        cancelled: 'canceled',
      }

      Object.entries(statusMap).forEach(([txStatus, expectedStatus]) => {
        const mockResponse: OrderStatusResponse = {
          orders: [
            {
              source: 'Test',
              firstObserved: 0,
              lastUpdated: 0,
              totalSubmitted: {},
              totalRequested: {},
              totalReceived: {},
              swaps: [
                {
                  dex: 'Minswap',
                  orderType: 0,
                  txStatus: txStatus as any,
                  submitTxHash: 'test',
                  submitTxIndex: 0,
                  submitTime: 0,
                  submitAssets: [{lovelace: 1000000}],
                  requestAssets: [{lovelace: 2000000}],
                  executeTxHash: null,
                  executeTxIndex: null,
                  executeTime: null,
                  receivedAssets: null,
                },
              ],
            },
          ],
          page: 1,
          lastPage: 1,
        }

        const result = transformers.orders.response(mockResponse)
        expect(result[0]?.status).toBe(expectedStatus)
      })
    })
  })

  describe('estimate', () => {
    it('should transform estimate request correctly', () => {
      const request = transformers.estimate.request({
        tokenIn: '.' as const,
        tokenOut:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
        amountIn: 2, // 2 ADA in decimal
        slippage: 0.5,
        blockedProtocols: [Swap.Protocol.Minswap_v1],
      })

      expect(request).toMatchObject({
        tokenA: 'lovelace',
        tokenB:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441',
        quantity: 2, // Already in decimal format (isFloat=true)
        predictFromOutputAmount: false,
        partner: 'yoroi-aggregator',
        isFloat: true,
      })
    })

    it('should handle amountOut instead of amountIn', () => {
      const request = transformers.estimate.request({
        tokenIn: '.' as const,
        tokenOut:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
        amountOut: 1, // 1 token in decimal
        slippage: 0.5,
      })

      expect(request).toMatchObject({
        quantity: 1, // Already in decimal format (isFloat=true)
        predictFromOutputAmount: true,
        isFloat: true,
      })
    })

    it('should transform estimate response correctly (SplitOutput)', () => {
      const mockResponse: SplitOutput = {
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
            volumeFee: 1000, // Already in decimal format (isFloat=true)
          },
        ],
      }

      const result = transformers.estimate.response(mockResponse)

      expect(result).toMatchObject({
        totalInput: 2000000, // Already in decimal format (isFloat=true)
        totalOutput: 1089627, // Already in decimal format (isFloat=true)
        totalFee: 0.1, // 100000 (batcher) + 0 (steelswap) = 0.1 ADA (already converted)
        batcherFee: 0.1, // Already in ADA (isFloat=true)
        deposits: 0,
        aggregatorFee: 0,
        frontendFee: 0,
        netPrice: 0.5448135, // 1089627 / 2000000 = output/input
        priceImpact: 0,
        splits: [
          {
            amountIn: 2000000, // Already in decimal format (isFloat=true)
            expectedOutput: 1089627, // Already in decimal format (isFloat=true)
            batcherFee: 0.1, // Already in ADA (isFloat=true)
            deposits: 0,
            fee: 1000, // Already in decimal format (isFloat=true)
            poolFee: 1000, // Already in decimal format (isFloat=true)
            protocol: Swap.Protocol.Splash_v1,
            aggregator: Swap.Aggregator.Steelswap,
            aggregatorDexKey: 'Splash',
            aggregatorPoolId: 'test-pool-id',
          },
        ],
      })
    })

    it('should transform estimate response correctly (HopSplitOutput)', () => {
      const mockResponse = {
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
                  volumeFee: 1000, // Already in decimal format (isFloat=true)
                },
              ],
            },
          ],
        ],
      }

      const result = transformers.estimate.response(mockResponse)

      expect(result).toMatchObject({
        totalInput: 2000000, // Already in decimal format (isFloat=true)
        totalOutput: 1089627, // Already in decimal format (isFloat=true)
        totalFee: 0.1, // 100000 (batcher) + 0 (steelswap) = 0.1 ADA (already converted)
      })
    })

    it('should throw error for invalid estimate response', () => {
      const mockResponse = {
        splitGroup: [[]],
      }

      expect(() => {
        transformers.estimate.response(mockResponse as any)
      }).toThrow('Invalid estimate response')
    })
  })

  describe('create', () => {
    it('should transform create request correctly', () => {
      const request = transformers.create.request({
        tokenIn: '.' as const,
        tokenOut:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
        amountIn: 2, // 2 ADA in decimal
        slippage: 0.5,
        inputs: ['test-utxo-1', 'test-utxo-2'],
        blockedProtocols: [Swap.Protocol.Minswap_v1],
      })

      expect(request).toMatchObject({
        tokenA: 'lovelace',
        tokenB:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441',
        quantity: 2, // Already in decimal format (isFloat=true)
        address: 'addr1test',
        utxos: ['test-utxo-1', 'test-utxo-2'],
        slippage: 50, // 0.5% = 50 basis points
        partner: 'yoroi-aggregator',
        isFloat: true,
      })
    })

    it('should handle zero slippage', () => {
      const request = transformers.create.request({
        tokenIn: '.' as const,
        tokenOut:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
        amountIn: 2000000,
        inputs: [],
      })

      expect(request.slippage).toBe(0)
    })

    it('should transform create response correctly', () => {
      const mockResponse: BuildSwapResponse = {
        tx: 'test-cbor-hex',
        p: false,
      }

      const result = transformers.create.response(mockResponse)

      expect(result).toMatchObject({
        aggregator: Swap.Aggregator.Steelswap,
        cbor: 'test-cbor-hex',
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
      })
    })
  })

  describe('cancel', () => {
    it('should transform cancel request correctly', () => {
      const request = transformers.cancel.request({
        order: {
          aggregator: Swap.Aggregator.Steelswap,
          protocol: Swap.Protocol.Minswap_v1,
          status: 'open',
          tokenIn: '.' as const,
          tokenOut:
            'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as const,
          amountIn: 1000000,
          expectedAmountOut: 2000000,
          actualAmountOut: 2000000,
          txHash: 'test-tx-hash',
          outputIndex: 0,
        },
      })

      expect(request).toMatchObject({
        txList: [
          {
            txHash: 'test-tx-hash',
            txIndex: 0,
          },
        ],
        ttl: 900,
        partner: 'yoroi-aggregator',
      })
    })

    it('should transform cancel response correctly', () => {
      const mockResponse: CancelResponse = 'test-cancel-cbor-hex'

      const result = transformers.cancel.response(mockResponse)

      expect(result).toEqual({
        cbor: 'test-cancel-cbor-hex',
      })
    })
  })

  describe('token ID conversion', () => {
    it('should convert lovelace to primary token ID', () => {
      const transformers = transformersMaker(mockConfig)
      // Test through estimate request
      const request = transformers.estimate.request({
        tokenIn: '.' as const,
        tokenOut: '.' as const,
        amountIn: 1, // Already in decimal format (isFloat=true)
        slippage: 0.5,
      })

      expect(request.tokenA).toBe('lovelace')
      expect(request.tokenB).toBe('lovelace')
    })

    it('should convert hex token ID to portfolio format', () => {
      const hexTokenId =
        'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441'
      const expectedPortfolioId =
        'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441'

      const request = transformers.estimate.request({
        tokenIn: expectedPortfolioId as Portfolio.Token.Id,
        tokenOut: '.' as const,
        amountIn: 1, // Already in decimal format (isFloat=true)
        slippage: 0.5,
      })

      expect(request.tokenA).toBe(hexTokenId)
    })
  })
})

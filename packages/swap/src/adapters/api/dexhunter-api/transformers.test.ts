import {Portfolio} from '@yoroi/types'

import {transformers} from './transformers'
import {DexHunterApi} from './types'
import {DexHunterApiMocks} from './api.mocks'

describe('Transformers', () => {
  describe('swap.request', () => {
    it('success', () => {
      const swapArgs: DexHunterApi.SwapArgs = {
        amountIn: 1000,
        blacklistedDexes: ['DEX1', 'DEX2'],
        address: 'user-address-123',
        inputs: ['input1', 'input2'],
        slippage: 0.5,
        tokenIn: 'tokenIn.Id',
        tokenOut: 'tokenOut.Id',
      }

      const expectedSwapRequest: DexHunterApi.SwapRequest = {
        amount_in: 1000,
        blacklisted_dexes: ['DEX1', 'DEX2'],
        buyer_address: 'user-address-123',
        inputs: ['input1', 'input2'],
        slippage: 0.5,
        token_in: 'tokenInId',
        token_out: 'tokenOutId',
      }

      const transformedRequest = transformers.swap.request(swapArgs)

      expect(transformedRequest).toEqual(expectedSwapRequest)
      expect(Object.isFrozen(transformedRequest)).toBe(true)
    })
  })

  describe('swap.response', () => {
    it('success', () => {
      // TODO: REVISIT it looks it needs implementation cc: @jorbuedo
      const transformedResponse = transformers.swap.response(
        DexHunterApiMocks.swap.success,
      )

      expect(Object.isFrozen(transformedResponse)).toBe(true)
    })
  })

  describe('sign.request', () => {
    it('success', () => {
      const signArgs: DexHunterApi.SignArgs = {
        signatures: 'signature-string',
        txCbor: 'tx-cbor-data',
      }

      const expectedSignRequest: DexHunterApi.SignRequest = {
        Signatures: 'signature-string',
        txCbor: 'tx-cbor-data',
      }

      const transformedRequest = transformers.sign.request(signArgs)

      expect(transformedRequest).toEqual(expectedSignRequest)
      expect(Object.isFrozen(transformedRequest)).toBe(true)
    })
  })

  describe('sign.response', () => {
    it('success', () => {
      const expectedInternalResponse = {
        cbor: 'signed-tx-cbor',
        stratId: 'strategy-123',
      }

      const transformedResponse = transformers.sign.response(
        DexHunterApiMocks.sign.success,
      )

      expect(transformedResponse).toEqual(expectedInternalResponse)
      expect(Object.isFrozen(transformedResponse)).toBe(true)
    })
  })

  describe('orders.request', () => {
    it('success', () => {
      const ordersArgs: DexHunterApi.OrdersArgs = {
        address: 'user-address-123',
      }

      const expectedOrdersRequestParams = {
        userAddress: 'user-address-123',
      }

      const transformedRequest = transformers.orders.request(ordersArgs)

      expect(transformedRequest).toEqual(expectedOrdersRequestParams)
      expect(Object.isFrozen(transformedRequest)).toBe(true)
    })
  })

  describe('limitEstimate.request', () => {
    it('success', () => {
      const limitOrderArgs: DexHunterApi.LimitOrderArgs = {
        amountIn: 1500,
        blacklistedDexes: ['DEX3', 'DEX4'],
        address: 'user-address-789',
        dex: 'DEX5',
        multiples: 2,
        tokenIn: 'tokenIn.Id',
        tokenOut: 'tokenOut.Id',
        wantedPrice: 1.5,
      }
      const expectedLimitOrderRequest = {
        amount_in: 1500,
        blacklisted_dexes: ['DEX3', 'DEX4'],
        buyer_address: 'user-address-789',
        dex: 'DEX5',
        multiples: 2,
        token_in: 'tokenInId',
        token_out: 'tokenOutId',
        wanted_price: 1.5,
      }

      const transformedRequest =
        transformers.limitEstimate.request(limitOrderArgs)

      expect(transformedRequest).toEqual(expectedLimitOrderRequest)
      expect(Object.isFrozen(transformedRequest)).toBe(true)
    })
  })

  describe('limitEstimate.response', () => {
    it('success', () => {
      const expectedInternalResponse = {
        batcherFee: 0.15,
        blacklistedDexes: ['DEX6'],
        deposits: 100,
        dexhunterFee: 0.07,
        netPrice: 1.55,
        partner: 'partnerXYZ',
        partnerFee: 0.03,
        possibleRoutes: {},
        // TODO: REVISIT Yoroi currently doesn't have this object
        splits: [
          {
            amount_in: 700,
            batcher_fee: 0.07,
            deposits: 50,
            dex: 'DEX6',
            expected_output: 1050,
            expected_output_without_slippage: 1040,
            fee: 0.035,
            final_price: 1.55,
            initial_price: 1.5,
            pool_fee: 0.005,
            pool_id: 'poolXYZ',
            price_distortion: 0.025,
            price_impact: 0.035,
          },
        ],
        totalFee: 0.25,
        totalInput: 1400,
        totalOutput: 2100,
      }

      const transformedResponse = transformers.limitEstimate.response(
        DexHunterApiMocks.limitEstimate.success,
      )

      expect(transformedResponse).toEqual(expectedInternalResponse)
      expect(Object.isFrozen(transformedResponse)).toBe(true)
    })
  })

  describe('limit.request', () => {
    it('success', () => {
      const limitOrderArgs: DexHunterApi.LimitOrderArgs = {
        amountIn: 1500,
        blacklistedDexes: ['DEX3', 'DEX4'],
        address: 'user-address-789',
        dex: 'DEX5',
        multiples: 2,
        tokenIn: 'tokenIn.Id',
        tokenOut: 'tokenOut.Id',
        wantedPrice: 1.5,
      }

      const expectedLimitOrderRequest: DexHunterApi.LimitOrderRequest = {
        amount_in: 1500,
        blacklisted_dexes: ['DEX3', 'DEX4'],
        buyer_address: 'user-address-789',
        dex: 'DEX5',
        multiples: 2,
        token_in: 'tokenInId',
        token_out: 'tokenOutId',
        wanted_price: 1.5,
      }

      const transformedRequest = transformers.limit.request(limitOrderArgs)

      expect(transformedRequest).toEqual(expectedLimitOrderRequest)
      expect(Object.isFrozen(transformedRequest)).toBe(true)
    })
  })

  describe('limit.response', () => {
    it('success', () => {
      const expectedInternalResponse = {
        batcherFee: 0.15,
        cbor: 'some-cbor-data',
        deposits: 100,
        dexhunterFee: 0.07,
        partner: 'partnerXYZ',
        partnerFee: 0.03,
        possibleRoutes: {routeA: 'routeA', routeB: 'routeB'},
        splits: [
          {
            amount_in: 700,
            batcher_fee: 0.07,
            deposits: 50,
            dex: 'DEX6',
            expected_output: 1050,
            expected_output_without_slippage: 1040,
            fee: 0.035,
            final_price: 1.55,
            initial_price: 1.5,
            pool_fee: 0.005,
            pool_id: 'poolXYZ',
            price_distortion: 0.025,
            price_impact: 0.035,
          },
        ],
        totalInput: 1400,
        totalOutput: 2100,
      }

      const transformedResponse = transformers.limit.response(
        DexHunterApiMocks.limit.success,
      )

      expect(transformedResponse).toEqual(expectedInternalResponse)
      expect(Object.isFrozen(transformedResponse)).toBe(true)
    })
  })

  describe('reverseEstimate.request', () => {
    it('success', () => {
      const reverseEstimateArgs: DexHunterApi.ReverseEstimateArgs = {
        amountOut: 2000,
        blacklistedDexes: ['DEX1', 'DEX2'],
        address: 'buyer-address-123',
        isOptimized: true,
        slippage: 0.5,
        tokenIn: 'tokenIn.Id',
        tokenOut: 'tokenOut.Id',
      }

      const expectedReverseEstimateRequest: DexHunterApi.ReverseEstimateRequest =
        {
          amount_out: 2000,
          blacklisted_dexes: ['DEX1', 'DEX2'],
          buyer_address: 'buyer-address-123',
          is_optimized: true,
          slippage: 0.5,
          token_in: 'tokenInId',
          token_out: 'tokenOutId',
        }

      const transformedRequest =
        transformers.reverseEstimate.request(reverseEstimateArgs)

      expect(transformedRequest).toEqual(expectedReverseEstimateRequest)
      expect(Object.isFrozen(transformedRequest)).toBe(true)
    })
  })

  describe('reverseEstimate.response', () => {
    it('success', () => {
      const expectedInternalResponse = {
        averagePrice: 1.25,
        batcherFee: 0.1,
        communications: ['msg1', 'msg2'],
        deposits: 50,
        dexhunterFee: 0.05,
        netPrice: 1.2,
        netPriceReverse: 0.8,
        partnerFee: 0.02,
        possibleRoutes: {route1: 60, route2: 40},
        priceAB: 1.3,
        priceBA: 0.77,
        splits: [
          {
            amount_in: 600,
            batcher_fee: 0.06,
            deposits: 30,
            dex: 'DEX1',
            expected_output: 750,
            expected_output_without_slippage: 740,
            fee: 0.05,
            final_price: 1.25,
            initial_price: 1.2,
            pool_fee: 0.01,
            pool_id: 'pool123',
            price_distortion: 0.02,
            price_impact: 0.03,
          },
        ],
        totalFee: 0.23,
        totalInput: 1000,
        totalInputWithoutSlippage: 980,
        totalOutput: 1200,
      }

      const transformedResponse = transformers.reverseEstimate.response(
        DexHunterApiMocks.reverseEstimate.success,
      )

      expect(transformedResponse).toEqual(expectedInternalResponse)
      expect(Object.isFrozen(transformedResponse)).toBe(true)
    })
  })

  describe('estimate.request', () => {
    it('success', () => {
      const estimateArgs: DexHunterApi.EstimateArgs = {
        amountIn: 1000,
        blacklistedDexes: ['DEX5', 'DEX6'],
        singlePreferredDex: 'DEX7',
        slippage: 0.3,
        tokenIn: 'tokenIn.Id',
        tokenOut: 'tokenOut.Id',
      }

      const expectedEstimateRequest: DexHunterApi.EstimateRequest = {
        amount_in: 1000,
        blacklisted_dexes: ['DEX5', 'DEX6'],
        single_preferred_dex: 'DEX7',
        slippage: 0.3,
        token_in: 'tokenInId',
        token_out: 'tokenOutId',
      }

      const transformedRequest = transformers.estimate.request(estimateArgs)

      expect(transformedRequest).toEqual(expectedEstimateRequest)
      expect(Object.isFrozen(transformedRequest)).toBe(true)
    })
  })

  describe('estimate.response', () => {
    it('success', () => {
      const expectedInternalResponse = {
        averagePrice: 1.35,
        batcherFee: 0.12,
        communications: ['info1', 'info2'],
        deposits: 60,
        dexhunterFee: 0.06,
        netPrice: 1.3,
        netPriceReverse: 0.75,
        partnerCode: 'partnerABC',
        partnerFee: 0.025,
        possibleRoutes: {routeX: 55, routeY: 45},
        splits: [
          {
            amount_in: 650,
            batcher_fee: 0.065,
            deposits: 35,
            dex: 'DEX5',
            expected_output: 877.5,
            expected_output_without_slippage: 870,
            fee: 0.04,
            final_price: 1.35,
            initial_price: 1.3,
            pool_fee: 0.007,
            pool_id: 'poolABC',
            price_distortion: 0.03,
            price_impact: 0.04,
          },
        ],
        totalFee: 0.235,
        totalOutput: 1755,
        totalOutputWithoutSlippage: 1740,
      }

      const transformedResponse = transformers.estimate.response(
        DexHunterApiMocks.estimate.success,
      )

      expect(transformedResponse).toEqual(expectedInternalResponse)
      expect(Object.isFrozen(transformedResponse)).toBe(true)
    })
  })

  describe('cancel.request', () => {
    it('success', () => {
      const cancelArgs: DexHunterApi.CancelArgs = {
        address: 'user-address-456',
        orderId: 'order-789',
      }

      const expectedCancelRequest: DexHunterApi.CancelRequest = {
        address: 'user-address-456',
        order_id: 'order-789',
      }

      const transformedRequest = transformers.cancel.request(cancelArgs)

      expect(transformedRequest).toEqual(expectedCancelRequest)
      expect(Object.isFrozen(transformedRequest)).toBe(true)
    })
  })

  describe('cancel.response', () => {
    it('success', () => {
      const expectedInternalResponse = {
        cancellationFee: 0.05,
        cbor: 'cancel-tx-cbor-data',
      }

      const transformedResponse = transformers.cancel.response(
        DexHunterApiMocks.cancel.success,
      )

      expect(transformedResponse).toEqual(expectedInternalResponse)
      expect(Object.isFrozen(transformedResponse)).toBe(true)
    })
  })

  describe('averagePrice.request', () => {
    it('success', () => {
      const averagePriceArgs: DexHunterApi.AveragePriceArgs = {
        tokenInId: 'tokenIn.Id',
        tokenOutId: 'tokenOut.Id',
      }

      // TODO: REVISIT it looks incorrect since it supposed to be camelCase cc: @jorbuedo
      const expectedAveragePriceRequest = {
        tokenInId: 'tokenInId',
        tokenOutId: 'tokenOutId',
      }

      const transformedRequest =
        transformers.averagePrice.request(averagePriceArgs)

      expect(transformedRequest).toEqual(expectedAveragePriceRequest)
      expect(Object.isFrozen(transformedRequest)).toBe(true)
    })
  })

  describe('averagePrice.response', () => {
    it('success', () => {
      const expectedInternalResponse = 1.25

      const transformedResponse = transformers.averagePrice.response(
        DexHunterApiMocks.averagePrice.success,
      )

      expect(transformedResponse).toEqual(expectedInternalResponse)
    })
  })

  describe('tokens.response', () => {
    it('success', () => {
      // TODO: REVISIT willing to return only an array of ids cc: @jorbuedo
      const expectedInternalResponse: ReadonlyArray<Portfolio.Token.Info> = [
        {
          id: 'policy1.tokenA',
          type: Portfolio.Token.Type.FT,
          nature: Portfolio.Token.Nature.Secondary,
          decimals: 6,
          ticker: 'ALPHA',
          name: 'Token Alpha',
          symbol: 'ALPHA',
          status: Portfolio.Token.Status.Valid,
          application: Portfolio.Token.Application.General,
          tag: '',
          reference: '',
          fingerprint: '',
          description: '0.5, 1000000, 2023-01-01',
          website: '',
          originalImage: '',
        },
        {
          id: 'policy2.tokenB',
          type: Portfolio.Token.Type.FT,
          nature: Portfolio.Token.Nature.Secondary,
          decimals: 8,
          ticker: 'BETA',
          name: 'Token Beta',
          symbol: 'BETA',
          status: Portfolio.Token.Status.Unknown,
          application: Portfolio.Token.Application.General,
          tag: '',
          reference: '',
          fingerprint: '',
          description: '1.2, 500000, 2023-02-15',
          website: '',
          originalImage: '',
        },
      ]

      const transformedResponse = transformers.tokens.response(
        DexHunterApiMocks.tokens.success,
      )

      expect(transformedResponse).toEqual(expectedInternalResponse)
      expect(Object.isFrozen(transformedResponse)).toBe(true)
      transformedResponse.forEach((token) => {
        expect(Object.isFrozen(token)).toBe(true)
      })
    })
  })
})

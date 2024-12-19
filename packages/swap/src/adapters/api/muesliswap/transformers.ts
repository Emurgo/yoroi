import {Portfolio, Swap} from '@yoroi/types'
import {
  CancelRequest,
  CancelResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  HistoryOrdersResponse,
  LimitOrderRequest,
  LimitOrderResponse,
  LimitQuoteRequest,
  OpenOrdersResponse,
  PoolsRequest,
  PoolsResponse,
  Provider,
  ProvidersResponse,
  QuoteRequest,
  QuoteResponse,
  Split,
  TokensResponse,
} from './types'
import {MuesliswapApiConfig} from './api-maker'

export const transformersMaker = ({
  primaryTokenInfo,
  address,
}: MuesliswapApiConfig) => {
  return {
    tokens: {
      response: (res: TokensResponse): Array<Portfolio.Token.Info> =>
        res
          .map(({ticker, name, policyId, hexName, decimals}) => {
            const id = `${policyId}.${hexName}`

            const isPrimary = id === primaryTokenInfo.id
            if (isPrimary) return primaryTokenInfo
            if (decimals === null) return null
            return {
              id,
              fingerprint: '',
              name,
              decimals,
              description: '',
              originalImage: '',
              type: Portfolio.Token.Type.FT,
              nature: Portfolio.Token.Nature.Secondary,
              ticker,
              symbol: '',
              status: Portfolio.Token.Status.Valid,
              application: Portfolio.Token.Application.General,
              reference: '',
              tag: '',
              website: '',
            }
          })
          .filter((v): v is Portfolio.Token.Info => !!v),
    },
    openOrders: {
      response: ({orders}: OpenOrdersResponse): Array<Swap.Order> =>
        orders.map(
          ({dex, from_amount, from_token, to_amount, to_token, utxo}) => ({
            aggregator: Swap.Aggregator.Muesliswap,
            dex,
            status: 'open',
            tokenIn: from_token,
            tokenOut: to_token,
            amountIn: Number(from_amount),
            actualAmountOut: 0,
            expectedAmountOut: Number(to_amount),
            txHash: utxo.split('#')[0],
            updateTxHash: utxo.split('#')[0],
            outputIndex: Number(utxo.split('#')[1] ?? 0),
          }),
        ),
    },
    orderHistory: {
      response: ({orders}: HistoryOrdersResponse): Array<Swap.Order> =>
        orders.map(
          ({
            fromToken,
            toToken,
            placedAt,
            finalizedAt,
            receivedAmount,
            toAmount,
            fromAmount,
            txHash,
            finalizedTxHash,
            status,
            dex = Provider.Muesliswap_v2,
            outputIdx,
          }) => ({
            aggregator: Swap.Aggregator.Muesliswap,
            dex: toSwapProvider(dex),
            placedAt: placedAt ? placedAt * 1000 : undefined,
            lastUpdate: finalizedAt ? finalizedAt * 1000 : undefined,
            status,
            tokenIn: fromToken,
            tokenOut: toToken,
            amountIn: Number(fromAmount),
            actualAmountOut: Number(receivedAmount),
            expectedAmountOut: Number(toAmount),
            txHash,
            updateTxHash: finalizedTxHash ?? txHash,
            outputIndex: outputIdx ?? 0,
          }),
        ),
    },
    providers: {
      request: ({tokenA, tokenB}: Swap.ProvidersRequest): PoolsRequest => ({
        token_a: tokenA,
        token_b: tokenB,
      }),
      response: (
        pools: PoolsResponse = [],
        providersInfo: ProvidersResponse,
      ): Swap.ProvidersResponse =>
        pools.map(
          ({
            pool_fee,
            pool_id,
            provider,
            token_a,
            token_a_liquidity,
            token_b,
            token_b_liquidity,
          }) => ({
            aggregator: Swap.Aggregator.Muesliswap,
            provider,
            batcherFee:
              (providersInfo[provider]?.batcher_fee ?? 0) /
              10 ** primaryTokenInfo.decimals,
            deposit:
              (providersInfo[provider]?.deposit ?? 0) /
              10 ** primaryTokenInfo.decimals,
            poolFee: pool_fee,
            poolId: pool_id,
            tokenA: token_a,
            tokenALiquidity: token_a_liquidity,
            tokenB: token_b,
            tokenBLiquidity: token_b_liquidity,
          }),
        ),
    },
    cancel: {
      request: ({order}: Swap.CancelRequest): CancelRequest => ({
        tx_hash: order.txHash ?? '',
        output_idx: order.outputIndex ?? 0,
      }),
      response: ({tx_cbor = ''}: CancelResponse): Swap.CancelResponse => ({
        cbor: tx_cbor,
      }),
    },
    limitQuote: {
      request: ({
        dex,
        tokenIn,
        tokenOut,
        amountIn = 0,
        wantedPrice = 0,
      }: Swap.EstimateRequest): LimitQuoteRequest => ({
        dex: fromSwapProvider(dex ?? Swap.Provider.Muesliswap_v2),
        sell_token: tokenIn,
        buy_token: tokenOut,
        sell_amount: amountIn,
        buy_amount: amountIn * wantedPrice,
        numbers_have_decimals: true,
      }),
    },
    quote: {
      request: ({
        dex,
        blacklistedDexes,
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        slippage,
      }: Swap.EstimateRequest): QuoteRequest => ({
        dex: dex
          ? [fromSwapProvider(dex)]
          : Object.values(Provider).filter(
              (provider) => !blacklistedDexes?.includes(provider),
            ),
        sell_token: tokenIn,
        buy_token: tokenOut,
        buy_amount: amountOut,
        sell_amount: amountIn,
        slippage,
        numbers_have_decimals: true,
      }),
      response: ({
        // buy_token_decimals,
        // sell_token_decimals,
        net_price,
        splits,
        total_batcher_fee,
        total_deposit,
        total_input,
        total_lvl_attached,
        total_output,
        total_output_without_slippage,
      }: QuoteResponse): Swap.EstimateResponse => ({
        aggregatorFee: 0,
        frontendFee: 0,
        batcherFee: total_batcher_fee,
        deposits: total_deposit,
        totalFee: total_lvl_attached,
        totalInput: total_input,
        totalOutput: total_output,
        netPrice: net_price,
        totalOutputWithoutSlippage: total_output_without_slippage,
        splits: splits.map(transformSplit),
      }),
    },
    create: {
      request: ({
        dex,
        blacklistedDexes,
        tokenIn,
        tokenOut,
        amountIn,
        slippage,
      }: Swap.CreateRequest): CreateOrderRequest => ({
        dex: dex
          ? [fromSwapProvider(dex)]
          : Object.values(Provider).filter(
              (provider) => !blacklistedDexes?.includes(provider),
            ),
        sell_token: tokenIn,
        buy_token: tokenOut,
        sell_amount: amountIn,
        slippage,
        user_address: address,
        numbers_have_decimals: true,
      }),
      response: ({
        quote: {
          // buy_token_decimals,
          // sell_token_decimals,
          net_price,
          splits,
          total_batcher_fee,
          total_deposit,
          total_input,
          total_lvl_attached,
          total_output,
          total_output_without_slippage,
        },
        tx_cbor,
      }: CreateOrderResponse): Swap.CreateResponse => ({
        cbor: tx_cbor,
        aggregator: Swap.Aggregator.Muesliswap,
        aggregatorFee: 0,
        frontendFee: 0,
        batcherFee: total_batcher_fee,
        deposits: total_deposit,
        totalFee: total_lvl_attached,
        totalInput: total_input,
        totalOutput: total_output,
        netPrice: net_price,
        totalOutputWithoutSlippage: total_output_without_slippage,
        splits: splits.map(transformSplit),
      }),
    },
    createLimit: {
      request: ({
        dex = Swap.Provider.Muesliswap_v2,
        tokenIn,
        tokenOut,
        amountIn,
        wantedPrice = 0,
      }: Swap.CreateRequest): LimitOrderRequest => ({
        dex: fromSwapProvider(dex),
        sell_token: tokenIn,
        buy_token: tokenOut,
        sell_amount: amountIn,
        buy_amount: amountIn * wantedPrice,
        user_address: address,
        numbers_have_decimals: true,
      }),
      // LimitOrderResponse doesn't have quote data :(
      response: ({tx_cbor}: LimitOrderResponse): Swap.CreateResponse => ({
        cbor: tx_cbor,
        aggregator: Swap.Aggregator.Muesliswap,
        aggregatorFee: 0,
        frontendFee: 0,
        batcherFee: 0,
        deposits: 0,
        totalFee: 0,
        totalInput: 0,
        totalOutput: 0,
        netPrice: 0,
        totalOutputWithoutSlippage: 0,
        splits: [],
      }),
    },
  } as const
}

const transformSplit = ({
  amount_in,
  batcher_fee,
  deposit,
  dex,
  expected_output,
  expected_output_without_slippage,
  final_price,
  initial_price,
  pool_fee,
  price_impact,
  source_id,
}: Split): Swap.Split => ({
  amountIn: amount_in,
  batcherFee: batcher_fee,
  deposits: deposit,
  dex: toSwapProvider(dex),
  expectedOutput: expected_output,
  expectedOutputWithoutSlippage: expected_output_without_slippage,
  fee: pool_fee,
  finalPrice: final_price,
  initialPrice: initial_price,
  poolFee: pool_fee,
  poolId: source_id,
  priceDistortion: price_impact,
  priceImpact: price_impact,
})

const toSwapProvider = (dex: Provider): Swap.Provider =>
  ({
    [Provider.Minswap_v1]: Swap.Provider.Minswap_v1,
    [Provider.Minswap_v2]: Swap.Provider.Minswap_v2,
    [Provider.Minswap_stable]: Swap.Provider.Minswap_stable,
    [Provider.Wingriders_v1]: Swap.Provider.Wingriders_v1,
    [Provider.Vyfi_v1]: Swap.Provider.Vyfi_v1,
    [Provider.Sundaeswap_v1]: Swap.Provider.Sundaeswap_v1,
    [Provider.Sundaeswap_v3]: Swap.Provider.Sundaeswap_v3,
    [Provider.Muesliswap_v2]: Swap.Provider.Muesliswap_v2,
    [Provider.Muesliswap_clp]: Swap.Provider.Muesliswap_clp,
    [Provider.Spectrum_v1]: Swap.Provider.Spectrum_v1,
    [Provider.Teddy_v1]: Swap.Provider.Teddy_v1,
  }[dex])

const fromSwapProvider = (dex: Swap.Provider): Provider =>
  ({
    [Swap.Provider.Minswap_v1]: Provider.Minswap_v1,
    [Swap.Provider.Minswap_v2]: Provider.Minswap_v2,
    [Swap.Provider.Minswap_stable]: Provider.Minswap_stable,
    [Swap.Provider.Wingriders_v1]: Provider.Wingriders_v1,
    [Swap.Provider.Wingriders_v2]: undefined,
    [Swap.Provider.Vyfi_v1]: Provider.Vyfi_v1,
    [Swap.Provider.Sundaeswap_v1]: Provider.Sundaeswap_v1,
    [Swap.Provider.Sundaeswap_v3]: Provider.Sundaeswap_v3,
    [Swap.Provider.Splash_v1]: undefined,
    [Swap.Provider.Teddy_v1]: Provider.Teddy_v1,
    [Swap.Provider.Muesliswap_v2]: Provider.Muesliswap_v2,
    [Swap.Provider.Muesliswap_clp]: Provider.Muesliswap_clp,
    [Swap.Provider.Spectrum_v1]: Provider.Spectrum_v1,
  }[dex] ?? Provider.Muesliswap_v2)

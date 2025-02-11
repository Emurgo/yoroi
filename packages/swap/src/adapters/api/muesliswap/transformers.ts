import {Portfolio, Swap} from '@yoroi/types'

import {
  CancelRequest,
  CancelResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  OrdersHistoryResponse,
  LimitOrderRequest,
  LimitOrderResponse,
  LimitQuoteRequest,
  Dex,
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
          .map(({ticker, name, policyId, hexName, decimals, verified}) => {
            const id = `${policyId}.${hexName}`

            const isPrimary = id === primaryTokenInfo.id
            if (isPrimary) return primaryTokenInfo

            if (decimals === null) return null

            return {
              status: verified
                ? Portfolio.Token.Status.Valid
                : Portfolio.Token.Status.Invalid,
              id,
              ticker,
              name,

              type: Portfolio.Token.Type.FT,
              nature: Portfolio.Token.Nature.Secondary,
              application: Portfolio.Token.Application.General,
              fingerprint: '',
              decimals,
              description: '',
              originalImage: '',
              symbol: '',
              reference: '',
              tag: '',
              website: '',
            }
          })
          .filter((v): v is Portfolio.Token.Info => !!v),
    },
    ordersHistory: {
      response: ({orders}: OrdersHistoryResponse): Array<Swap.Order> =>
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

            dex = Dex.Muesliswap_v2,
            outputIdx = 0,
          }) => ({
            status,
            txHash,
            aggregator: Swap.Aggregator.Muesliswap,
            outputIndex: outputIdx,
            tokenIn: fromToken,
            tokenOut: toToken,

            amountIn: Number(fromAmount),
            actualAmountOut: Number(receivedAmount),
            expectedAmountOut: Number(toAmount),

            updateTxHash: finalizedTxHash ?? txHash,
            placedAt: placedAt ? placedAt * 1000 : undefined,
            lastUpdate: finalizedAt ? finalizedAt * 1000 : undefined,
            protocol: toSwapProtocol(dex),
          }),
        ),
    },
    protocols: {
      response: (): Array<Swap.AggregatorProtocol> =>
        Object.values(Dex)
          .map(toSwapProtocol)
          .map((protocol) => ({
            aggregator: Swap.Aggregator.Muesliswap,
            protocol,
          })),
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
        protocol,
        tokenIn,
        tokenOut,
        amountIn = 0,
        wantedPrice = 0,
      }: Swap.EstimateRequest): LimitQuoteRequest => ({
        dex: fromSwapProtocol(protocol ?? Swap.Protocol.Muesliswap_v2),
        sell_token: tokenIn,
        buy_token: tokenOut,
        sell_amount: amountIn,
        buy_amount: amountIn * wantedPrice,
        numbers_have_decimals: true,
      }),
    },
    quote: {
      request: ({
        protocol,
        blockedProtocols,
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        slippage,
      }: Swap.EstimateRequest): QuoteRequest => ({
        dex: protocol
          ? [fromSwapProtocol(protocol)]
          : Object.values(Dex).filter(
              (dex) => !blockedProtocols?.includes(dex),
            ),
        sell_token: tokenIn,
        buy_token: tokenOut,
        buy_amount: amountOut,
        sell_amount: amountIn,
        slippage: slippage / 100,
        numbers_have_decimals: true,
      }),
      response: ({
        buy_token_decimals,
        sell_token_decimals,
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
        batcherFee: Number(total_batcher_fee),
        deposits: Number(total_deposit),
        totalFee: Number(total_lvl_attached),
        totalInput: Number(total_input),
        totalOutput: Number(total_output),
        netPrice: net_price * 10 ** (sell_token_decimals - buy_token_decimals),
        totalOutputWithoutSlippage: Number(total_output_without_slippage),
        splits: splits.map(transformSplit),
      }),
    },
    create: {
      request: ({
        protocol,
        blockedProtocols,
        tokenIn,
        tokenOut,
        amountIn,
        slippage = 0,
      }: Swap.CreateRequest): CreateOrderRequest => ({
        dex: protocol
          ? [fromSwapProtocol(protocol)]
          : Object.values(Dex).filter(
              (dex) => !blockedProtocols?.includes(dex),
            ),
        sell_token: tokenIn,
        buy_token: tokenOut,
        sell_amount: amountIn,
        slippage: slippage / 100,
        user_address: address,
        numbers_have_decimals: true,
      }),
      response: ({
        quote: {
          buy_token_decimals,
          sell_token_decimals,
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
        batcherFee: Number(total_batcher_fee),
        deposits: Number(total_deposit),
        totalFee: Number(total_lvl_attached),
        totalInput: Number(total_input),
        totalOutput: Number(total_output),
        netPrice: net_price * 10 ** (sell_token_decimals - buy_token_decimals),
        totalOutputWithoutSlippage: Number(total_output_without_slippage),
        splits: splits.map(transformSplit),
      }),
    },
    createLimit: {
      request: ({
        protocol = Swap.Protocol.Muesliswap_v2,
        tokenIn,
        tokenOut,
        amountIn,
        wantedPrice = 0,
      }: Swap.CreateRequest): LimitOrderRequest => ({
        dex: fromSwapProtocol(protocol),
        sell_token: tokenIn,
        buy_token: tokenOut,
        sell_amount: amountIn,
        buy_amount: amountIn * wantedPrice,
        user_address: address,
        numbers_have_decimals: true,
      }),
      response: ({tx_cbor}: LimitOrderResponse): Swap.CreateResponse => ({
        cbor: tx_cbor,
        aggregator: Swap.Aggregator.Muesliswap,

        // LimitOrderResponse doesn't have quote data :(
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
  amountIn: Number(amount_in),
  batcherFee: Number(batcher_fee),
  deposits: Number(deposit),
  protocol: toSwapProtocol(dex),
  expectedOutput: Number(expected_output),
  expectedOutputWithoutSlippage: Number(expected_output_without_slippage),
  fee: pool_fee,
  finalPrice: final_price,
  initialPrice: initial_price,
  poolFee: pool_fee,
  poolId: source_id,
  priceDistortion: price_impact,
  priceImpact: price_impact,
})

export const toSwapProtocol = (dex: Dex): Swap.Protocol =>
  ({
    [Dex.Minswap_v1]: Swap.Protocol.Minswap_v1,
    [Dex.Minswap_v2]: Swap.Protocol.Minswap_v2,
    [Dex.Minswap_stable]: Swap.Protocol.Minswap_stable,
    [Dex.Wingriders_v1]: Swap.Protocol.Wingriders_v1,
    [Dex.Vyfi_v1]: Swap.Protocol.Vyfi_v1,
    [Dex.Sundaeswap_v1]: Swap.Protocol.Sundaeswap_v1,
    [Dex.Sundaeswap_v3]: Swap.Protocol.Sundaeswap_v3,
    [Dex.Muesliswap_v2]: Swap.Protocol.Muesliswap_v2,
    [Dex.Muesliswap_clp]: Swap.Protocol.Muesliswap_clp,
    [Dex.Spectrum_v1]: Swap.Protocol.Spectrum_v1,
    [Dex.Teddy_v1]: Swap.Protocol.Teddy_v1,
  }[dex])

export const fromSwapProtocol = (dex: Swap.Protocol): Dex =>
  ({
    [Swap.Protocol.Minswap_v1]: Dex.Minswap_v1,
    [Swap.Protocol.Minswap_v2]: Dex.Minswap_v2,
    [Swap.Protocol.Minswap_stable]: Dex.Minswap_stable,
    [Swap.Protocol.Wingriders_v1]: Dex.Wingriders_v1,
    [Swap.Protocol.Wingriders_v2]: undefined,
    [Swap.Protocol.Vyfi_v1]: Dex.Vyfi_v1,
    [Swap.Protocol.Sundaeswap_v1]: Dex.Sundaeswap_v1,
    [Swap.Protocol.Sundaeswap_v3]: Dex.Sundaeswap_v3,
    [Swap.Protocol.Splash_v1]: undefined,
    [Swap.Protocol.Teddy_v1]: Dex.Teddy_v1,
    [Swap.Protocol.Muesliswap_v2]: Dex.Muesliswap_v2,
    [Swap.Protocol.Muesliswap_clp]: Dex.Muesliswap_clp,
    [Swap.Protocol.Spectrum_v1]: Dex.Spectrum_v1,
  }[dex] ?? Dex.Muesliswap_v2)

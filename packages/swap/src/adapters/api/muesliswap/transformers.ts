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
import {resolveDexes} from './helpers'

export const transformersMaker = ({
  primaryTokenInfo,
  address,
  partner,
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
            dex,
            outputIdx,
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
          }) => ({
            status,
            txHash,

            aggregator: Swap.Aggregator.Muesliswap,
            outputIndex: outputIdx,
            tokenIn: fromToken,
            tokenOut: toToken,

            updateTxHash: finalizedTxHash ?? txHash,
            placedAt: placedAt ? placedAt * 1000 : undefined,
            lastUpdate: finalizedAt ? finalizedAt * 1000 : undefined,
            amountIn: Number(fromAmount),
            actualAmountOut: Number(receivedAmount),
            expectedAmountOut: Number(toAmount),
            protocol: toSwapProtocol(dex),
          }),
        ),
    },

    cancel: {
      request: ({order}: Swap.CancelRequest): CancelRequest => ({
        tx_hash: order.txHash,
        output_idx: order.outputIndex ?? 0,
      }),
      response: ({tx_cbor}: CancelResponse): Swap.CancelResponse => ({
        cbor: tx_cbor,
      }),
    },

    limitQuote: {
      request: ({
        amountIn = 0,
        wantedPrice = 0,

        protocol,
        tokenIn,
        tokenOut,
      }: Swap.EstimateRequest): LimitQuoteRequest => ({
        numbers_have_decimals: true,
        sell_token: tokenIn,
        buy_token: tokenOut,
        sell_amount: String(amountIn),

        buy_amount: String(amountIn * wantedPrice),
        dex: protocol ? fromSwapProtocol(protocol) : undefined,
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
        numbers_have_decimals: true,
        sell_token: tokenIn,
        buy_token: tokenOut,
        ...(amountOut !== undefined && {buy_amount: String(amountOut)}),
        ...(amountIn !== undefined && {sell_amount: String(amountIn)}),
        ...(partner !== undefined && {partner}),
        // muesli expects slippage as a percentage
        slippage: slippage / 100,
        dex: resolveDexes({
          protocol: protocol ? fromSwapProtocol(protocol) : undefined,
          blockedProtocols: blockedProtocols?.map(fromSwapProtocol),
        }),
      }),
      response: ({
        buy_token_decimals,
        sell_token_decimals,
        net_price,
        net_price_impact,
        splits,
        total_batcher_fee,
        total_deposit,
        total_input,
        frontend_fee,
        total_output,
        total_output_without_slippage,
      }: QuoteResponse): Swap.EstimateResponse => ({
        aggregatorFee: 0,
        frontendFee: 0,
        netPrice: net_price * 10 ** (sell_token_decimals - buy_token_decimals),
        priceImpact: net_price_impact,
        batcherFee: Number(total_batcher_fee),
        deposits: Number(total_deposit),
        totalFee: Number(
          (Number(total_batcher_fee) + Number(frontend_fee)).toFixed(
            primaryTokenInfo.decimals,
          ),
        ),
        totalInput: Number(total_input),
        totalOutput: Number(total_output),
        totalOutputWithoutSlippage:
          total_output_without_slippage === undefined
            ? undefined
            : Number(total_output_without_slippage),
        splits: splits.map(toSwapSplit),
      }),
    },

    create: {
      request: ({
        slippage = 0,
        protocol,
        blockedProtocols,
        tokenIn,
        tokenOut,
        amountIn,
        inputs,
      }: Swap.CreateRequest): CreateOrderRequest => ({
        numbers_have_decimals: true,
        sell_token: tokenIn,
        buy_token: tokenOut,
        sell_amount: String(amountIn),
        user_address: address,
        ...(partner !== undefined && {partner}),
        slippage: slippage / 100,
        dex: resolveDexes({
          protocol: protocol ? fromSwapProtocol(protocol) : undefined,
          blockedProtocols: blockedProtocols?.map(fromSwapProtocol),
        }),
        utxos: inputs,
      }),
      response: ({
        quote: {
          buy_token_decimals,
          sell_token_decimals,
          net_price,
          net_price_impact,
          splits,
          frontend_fee,
          total_batcher_fee,
          total_deposit,
          total_input,
          total_output,
          total_output_without_slippage,
        },
        tx_cbor,
      }: CreateOrderResponse): Swap.CreateResponse => ({
        aggregator: Swap.Aggregator.Muesliswap,
        aggregatorFee: 0,
        frontendFee: Number(frontend_fee),
        cbor: tx_cbor,
        netPrice: net_price * 10 ** (sell_token_decimals - buy_token_decimals),
        priceImpact: net_price_impact,
        batcherFee: Number(total_batcher_fee),
        deposits: Number(total_deposit),
        totalFee: Number(
          (Number(total_batcher_fee) + Number(frontend_fee)).toFixed(
            primaryTokenInfo.decimals,
          ),
        ),
        totalInput: Number(total_input),
        totalOutput: Number(total_output),
        totalOutputWithoutSlippage: Number(total_output_without_slippage),
        splits: splits.map(toSwapSplit),
      }),
    },

    createLimit: {
      request: ({
        protocol = Swap.Protocol.Unsupported,
        wantedPrice = 0,

        tokenIn,
        tokenOut,
        amountIn,
        inputs,
      }: Swap.CreateRequest): LimitOrderRequest => ({
        dex: fromSwapProtocol(protocol),
        buy_amount: String(amountIn * wantedPrice),

        numbers_have_decimals: true,
        sell_token: tokenIn,
        buy_token: tokenOut,
        sell_amount: String(amountIn),
        user_address: address,
        utxos: inputs,
      }),
      response: ({
        quote: {
          buy_token_decimals,
          sell_token_decimals,
          net_price,
          net_price_impact,
          splits,
          frontend_fee,
          total_batcher_fee,
          total_deposit,
          total_input,
          total_output,
          total_output_without_slippage,
        },
        tx_cbor,
      }: LimitOrderResponse): Swap.CreateResponse => ({
        cbor: tx_cbor,
        aggregator: Swap.Aggregator.Muesliswap,

        aggregatorFee: 0,
        frontendFee: Number(frontend_fee),
        netPrice: net_price * 10 ** (sell_token_decimals - buy_token_decimals),
        priceImpact: net_price_impact,
        batcherFee: Number(total_batcher_fee),
        deposits: Number(total_deposit),
        totalFee: Number(
          (Number(total_batcher_fee) + Number(frontend_fee)).toFixed(
            primaryTokenInfo.decimals,
          ),
        ),
        totalInput: Number(total_input),
        totalOutput: Number(total_output),
        totalOutputWithoutSlippage: Number(total_output_without_slippage),
        splits: splits.map(toSwapSplit),
      }),
    },
  } as const
}

const toSwapSplit = ({
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
  price_distortion,
  source_id,
}: Split): Swap.Split => ({
  fee: pool_fee,
  finalPrice: final_price,
  initialPrice: initial_price,
  poolFee: pool_fee,
  poolId: source_id,
  priceDistortion: price_distortion,
  priceImpact: price_impact,

  amountIn: Number(amount_in),
  batcherFee: Number(batcher_fee),
  deposits: Number(deposit),
  expectedOutput: Number(expected_output),
  expectedOutputWithoutSlippage: Number(
    expected_output_without_slippage ?? expected_output,
  ),

  protocol: toSwapProtocol(dex),
})

export const toSwapProtocol = (dex: Dex): Swap.Protocol =>
  ({
    [Dex.Minswap_v1]: Swap.Protocol.Minswap_v1,
    [Dex.Minswap_v2]: Swap.Protocol.Minswap_v2,
    [Dex.Minswap_stable]: Swap.Protocol.Minswap_stable,
    [Dex.Wingriders_v1]: Swap.Protocol.Wingriders_v1,
    [Dex.Wingriders_v2]: Swap.Protocol.Wingriders_v2,
    [Dex.Vyfi_v1]: Swap.Protocol.Vyfi_v1,
    [Dex.Sundaeswap_v1]: Swap.Protocol.Sundaeswap_v1,
    [Dex.Sundaeswap_v3]: Swap.Protocol.Sundaeswap_v3,
    [Dex.Muesliswap_v2]: Swap.Protocol.Muesliswap_v2,
    [Dex.Muesliswap_clp]: Swap.Protocol.Muesliswap_clp,
    [Dex.Spectrum_v1]: Swap.Protocol.Spectrum_v1,
    [Dex.Teddy_v1]: Swap.Protocol.Teddy_v1,
    [Dex.Unsupported]: Swap.Protocol.Unsupported,
  }[dex] ?? Swap.Protocol.Unsupported)

export const fromSwapProtocol = (dex: Swap.Protocol): Dex =>
  ({
    [Swap.Protocol.Cswap]: undefined,
    [Swap.Protocol.Minswap_v1]: Dex.Minswap_v1,
    [Swap.Protocol.Minswap_v2]: Dex.Minswap_v2,
    [Swap.Protocol.Minswap_stable]: Dex.Minswap_stable,
    [Swap.Protocol.Wingriders_v1]: Dex.Wingriders_v1,
    [Swap.Protocol.Wingriders_v2]: Dex.Wingriders_v2,
    [Swap.Protocol.Vyfi_v1]: Dex.Vyfi_v1,
    [Swap.Protocol.Sundaeswap_v1]: Dex.Sundaeswap_v1,
    [Swap.Protocol.Sundaeswap_v3]: Dex.Sundaeswap_v3,
    [Swap.Protocol.Splash_v1]: undefined,
    [Swap.Protocol.Teddy_v1]: Dex.Teddy_v1,
    [Swap.Protocol.Muesliswap_v2]: Dex.Muesliswap_v2,
    [Swap.Protocol.Muesliswap_clp]: Dex.Muesliswap_clp,
    [Swap.Protocol.Spectrum_v1]: Dex.Spectrum_v1,
    [Swap.Protocol.Unsupported]: Dex.Unsupported,
  }[dex] ?? Dex.Unsupported)

export const MuesliswapProtocols = Object.values(Dex)
  .filter((p) => p !== Dex.Unsupported)
  .map(toSwapProtocol)

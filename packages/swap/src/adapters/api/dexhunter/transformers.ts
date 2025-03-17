import {Portfolio, Swap} from '@yoroi/types'

import {
  BuildRequest,
  BuildResponse,
  CancelRequest,
  CancelResponse,
  EstimateRequest,
  EstimateResponse,
  LimitBuildRequest,
  LimitBuildResponse,
  LimitEstimateRequest,
  LimitEstimateResponse,
  OrdersResponse,
  Dex,
  ReverseEstimateRequest,
  ReverseEstimateResponse,
  SignRequest,
  SignResponse,
  Split,
  TokensResponse,
} from './types'
import {DexhunterApiConfig} from './api-maker'
import {isDex} from './validators'

export const ptIdDh =
  '000000000000000000000000000000000000000000000000000000006c6f76656c616365'

export const toSwapSplit = ({
  amount_in = 0,
  batcher_fee = 0,
  deposits = 0,
  dex,
  expected_output = 0,
  expected_output_without_slippage = 0,
  fee = 0,
  final_price = 0,
  initial_price = 0,
  pool_fee = 0,
  pool_id = '',
  price_distortion = 0,
  price_impact = 0,
}: Split): Swap.Split => ({
  amountIn: amount_in,
  batcherFee: batcher_fee,
  deposits,
  protocol: toSwapProtocol(dex),
  expectedOutput: expected_output,
  expectedOutputWithoutSlippage: expected_output_without_slippage,
  fee,
  finalPrice: final_price,
  initialPrice: initial_price,
  poolFee: pool_fee,
  poolId: pool_id,
  priceDistortion: price_distortion,
  priceImpact: price_impact,
})

export const transformersMaker = ({
  primaryTokenInfo,
  address,
  isPrimaryToken,
}: DexhunterApiConfig) => {
  const fromTokenId = (tokenId: string): Portfolio.Token.Id =>
    tokenId === ptIdDh
      ? primaryTokenInfo.id
      : `${tokenId.slice(0, 56)}.${tokenId.slice(56)}`

  const toTokenId = (tokenId: Portfolio.Token.Id) =>
    isPrimaryToken(tokenId) ? 'ADA' : tokenId.replace('.', '')

  return {
    tokens: {
      fromId: fromTokenId,
      toId: toTokenId,
      response: (res: TokensResponse): Array<Portfolio.Token.Info> =>
        res.map(
          ({
            token_id,
            is_verified,

            token_decimals = 0,
            token_ascii = '',
            ticker = '',
          }) => {
            if (token_id === ptIdDh) return primaryTokenInfo
            return {
              id: fromTokenId(token_id),

              decimals: token_decimals,
              ticker: ticker,
              name: token_ascii,
              status: is_verified
                ? Portfolio.Token.Status.Valid
                : Portfolio.Token.Status.Invalid,

              type: Portfolio.Token.Type.FT,
              nature: Portfolio.Token.Nature.Secondary,
              application: Portfolio.Token.Application.General,
              symbol: '',
              tag: '',
              reference: '',
              fingerprint: '',
              description: '',
              website: '',
              originalImage: '',
            }
          },
        ),
    },

    orders: {
      response: (res: OrdersResponse): Array<Swap.Order> =>
        res.map(
          ({
            _id,
            dex,
            last_update,
            submission_time,
            output_index,

            actual_out_amount = 0,
            expected_out_amount = 0,
            amount_in = 0,
            is_dexhunter = false,
            status = '',
            token_id_in = '',
            token_id_out = '',
            tx_hash = '',
            update_tx_hash = '',
          }) => ({
            status,
            amountIn: amount_in,
            actualAmountOut: actual_out_amount,
            expectedAmountOut: expected_out_amount,
            txHash: tx_hash,
            outputIndex: output_index,
            updateTxHash: update_tx_hash,
            customId: _id,

            placedAt: submission_time
              ? new Date(submission_time).getTime()
              : undefined,
            lastUpdate: last_update
              ? new Date(last_update).getTime()
              : undefined,
            aggregator: is_dexhunter
              ? Swap.Aggregator.Dexhunter
              : Swap.Aggregator.Muesliswap,
            protocol: toSwapProtocol(dex),
            tokenIn: fromTokenId(token_id_in),
            tokenOut: fromTokenId(token_id_out),
          }),
        ),
    },

    protocols: {
      response: (): Array<Swap.AggregatorProtocol> =>
        Object.values(Dex)
          .map(toSwapProtocol)
          .map((protocol) => ({
            aggregator: Swap.Aggregator.Dexhunter,
            protocol,
          })),
    },

    cancel: {
      request: ({order}: Swap.CancelRequest): CancelRequest => ({
        address,
        order_id: order.customId,
      }),
      response: ({
        additional_cancellation_fee,
        cbor = '',
      }: CancelResponse): Swap.CancelResponse => ({
        cbor,
        additionalCancellationFee: additional_cancellation_fee,
      }),
    },

    estimate: {
      request: ({
        amountIn,
        blockedProtocols,
        slippage,
        tokenIn,
        tokenOut,
      }: Swap.EstimateRequest): EstimateRequest => ({
        slippage,
        amount_in: amountIn,

        blacklisted_dexes: blockedProtocols
          ?.map(fromSwapProtocol)
          .filter(isDex),
        token_in: toTokenId(tokenIn),
        token_out: toTokenId(tokenOut),
      }),
      response: ({
        splits,

        batcher_fee = 0,
        deposits = 0,
        dexhunter_fee = 0,
        net_price = 0,
        partner_fee = 0,
        total_output = 0,
        total_output_without_slippage = 0,
      }: EstimateResponse): Swap.EstimateResponse => ({
        deposits,

        splits: splits?.map(toSwapSplit) ?? [],
        totalOutputWithoutSlippage: total_output_without_slippage,
        totalInput:
          splits?.reduce((acc, cur) => acc + (cur.amount_in ?? 0), 0) ??
          undefined,

        batcherFee: batcher_fee,
        aggregatorFee: dexhunter_fee,
        frontendFee: partner_fee,
        netPrice: net_price,
        totalFee: Number(
          (batcher_fee + dexhunter_fee).toFixed(primaryTokenInfo.decimals),
        ),
        totalOutput: total_output,
      }),
    },

    reverseEstimate: {
      request: ({
        amountOut,
        blockedProtocols,
        slippage,
        tokenIn,
        tokenOut,
      }: Swap.EstimateRequest): ReverseEstimateRequest => ({
        slippage,

        amount_out: amountOut,

        blacklisted_dexes: blockedProtocols
          ?.map(fromSwapProtocol)
          .filter(isDex),
        token_in: toTokenId(tokenIn),
        token_out: toTokenId(tokenOut),
      }),
      response: ({
        batcher_fee = 0,
        deposits = 0,
        dexhunter_fee = 0,
        net_price = 0,
        partner_fee = 0,
        splits,
        total_input = 0,
        total_output = 0,
      }: ReverseEstimateResponse): Swap.EstimateResponse => ({
        deposits,

        batcherFee: batcher_fee,
        aggregatorFee: dexhunter_fee,
        frontendFee: partner_fee,
        netPrice: net_price,
        totalFee: Number(
          (batcher_fee + dexhunter_fee).toFixed(primaryTokenInfo.decimals),
        ),
        totalOutput: total_output,
        totalOutputWithoutSlippage: total_output,

        splits: splits?.map(toSwapSplit) ?? [],
        totalInput:
          (total_input ||
            splits?.reduce((acc, cur) => acc + (cur.amount_in ?? 0), 0)) ??
          undefined,
      }),
    },

    limitEstimate: {
      request: ({
        protocol = Swap.Protocol.Unsupported,
        multiples = 1,

        amountIn,
        blockedProtocols,
        tokenIn,
        tokenOut,
        wantedPrice,
      }: Swap.EstimateRequest): LimitEstimateRequest => ({
        multiples,

        amount_in: amountIn,
        wanted_price: wantedPrice,

        blacklisted_dexes: blockedProtocols
          ?.map(fromSwapProtocol)
          .filter(isDex),
        dex: fromSwapProtocol(protocol),
        token_in: toTokenId(tokenIn),
        token_out: toTokenId(tokenOut),
      }),
      response: ({
        splits,

        batcher_fee = 0,
        deposits = 0,
        dexhunter_fee = 0,
        net_price = 0,
        partner_fee = 0,
        total_input = 0,
        total_output = 0,
      }: LimitEstimateResponse): Swap.EstimateResponse => ({
        deposits,

        batcherFee: batcher_fee,
        aggregatorFee: dexhunter_fee,
        frontendFee: partner_fee,
        netPrice: net_price,
        totalFee: Number(
          (batcher_fee + dexhunter_fee).toFixed(primaryTokenInfo.decimals),
        ),
        totalOutput: total_output,
        totalOutputWithoutSlippage: total_output,

        splits: splits?.map(toSwapSplit) ?? [],
        totalInput:
          (total_input ||
            splits?.reduce((acc, cur) => acc + (cur.amount_in ?? 0), 0)) ??
          undefined,
      }),
    },

    limitBuild: {
      request: ({
        amountIn,
        blockedProtocols,
        protocol,
        multiples,
        tokenIn,
        tokenOut,
        wantedPrice,
      }: Swap.CreateRequest): LimitBuildRequest => ({
        multiples,

        buyer_address: address,
        amount_in: amountIn,
        wanted_price: wantedPrice,

        token_in: toTokenId(tokenIn),
        token_out: toTokenId(tokenOut),
        blacklisted_dexes: blockedProtocols
          ?.map(fromSwapProtocol)
          .filter(isDex),
        dex: protocol ? fromSwapProtocol(protocol) : undefined,
      }),
      response: ({
        cbor = '',
        batcher_fee = 0,
        deposits = 0,
        dexhunter_fee = 0,
        partner_fee = 0,
        splits,
        total_input = 0,
        total_output = 0,
      }: LimitBuildResponse): Swap.CreateResponse => ({
        cbor,
        deposits,

        aggregator: Swap.Aggregator.Dexhunter,
        batcherFee: batcher_fee,
        aggregatorFee: dexhunter_fee,
        frontendFee: partner_fee,
        totalOutput: total_output,
        totalFee: Number(
          (batcher_fee + dexhunter_fee).toFixed(primaryTokenInfo.decimals),
        ),

        splits: splits?.map(toSwapSplit) ?? [],
        totalInput:
          (total_input ||
            splits?.reduce((acc, cur) => acc + (cur.amount_in ?? 0), 0)) ??
          0,
      }),
    },

    build: {
      request: ({
        slippage = 0,

        amountIn,
        blockedProtocols,
        tokenIn,
        tokenOut,
      }: Swap.CreateRequest): BuildRequest => ({
        slippage,

        amount_in: amountIn,
        buyer_address: address,

        blacklisted_dexes: blockedProtocols
          ?.map(fromSwapProtocol)
          .filter(isDex),
        token_in: toTokenId(tokenIn),
        token_out: toTokenId(tokenOut),
      }),
      response: ({
        splits,

        cbor = '',
        batcher_fee = 0,
        deposits = 0,
        dexhunter_fee = 0,
        net_price = 0,
        partner_fee = 0,
        total_input = 0,
        total_output = 0,
        total_output_without_slippage = 0,
      }: BuildResponse): Swap.CreateResponse => ({
        aggregator: Swap.Aggregator.Dexhunter,
        cbor,
        deposits,

        batcherFee: batcher_fee,
        aggregatorFee: dexhunter_fee,
        frontendFee: partner_fee,
        netPrice: (net_price || splits?.[0]?.initial_price) ?? 0, // main net_price is coming as 0 :(
        totalOutput: total_output,
        totalFee: Number(
          (batcher_fee + dexhunter_fee).toFixed(primaryTokenInfo.decimals),
        ),
        totalOutputWithoutSlippage: total_output_without_slippage,

        totalInput:
          (total_input ||
            splits?.reduce((acc, cur) => acc + (cur.amount_in ?? 0), 0)) ??
          0,
        splits: splits?.map(toSwapSplit) ?? [],
      }),
    },

    sign: {
      request: ({signatures, txCbor}: any): SignRequest => ({
        txCbor,
        Signatures: signatures,
      }),
      response: ({cbor, strat_id}: SignResponse) => ({cbor, stratId: strat_id}),
    },
  } as const
}

export const toSwapProtocol = (dex: Dex): Swap.Protocol =>
  ({
    [Dex.Minswap_v1]: Swap.Protocol.Minswap_v1,
    [Dex.Minswap_v2]: Swap.Protocol.Minswap_v2,
    [Dex.Wingriders_v1]: Swap.Protocol.Wingriders_v1,
    [Dex.Wingriders_v2]: Swap.Protocol.Wingriders_v2,
    [Dex.Vyfi_v1]: Swap.Protocol.Vyfi_v1,
    [Dex.Sundaeswap_v1]: Swap.Protocol.Sundaeswap_v1,
    [Dex.Sundaeswap_v3]: Swap.Protocol.Sundaeswap_v3,
    [Dex.Splash_v1]: Swap.Protocol.Splash_v1,
    [Dex.Muesliswap_clp]: Swap.Protocol.Muesliswap_clp,
    [Dex.Muesliswap_v2]: Swap.Protocol.Muesliswap_v2,
    [Dex.Unsupported]: Swap.Protocol.Unsupported,
  }[dex] ?? Swap.Protocol.Unsupported)

export const fromSwapProtocol = (dex: Swap.Protocol): Dex =>
  ({
    [Swap.Protocol.Minswap_v1]: Dex.Minswap_v1,
    [Swap.Protocol.Minswap_v2]: Dex.Minswap_v2,
    [Swap.Protocol.Minswap_stable]: Dex.Unsupported,
    [Swap.Protocol.Wingriders_v1]: Dex.Wingriders_v1,
    [Swap.Protocol.Wingriders_v2]: Dex.Wingriders_v2,
    [Swap.Protocol.Vyfi_v1]: Dex.Vyfi_v1,
    [Swap.Protocol.Sundaeswap_v1]: Dex.Sundaeswap_v1,
    [Swap.Protocol.Sundaeswap_v3]: Dex.Sundaeswap_v3,
    [Swap.Protocol.Splash_v1]: Dex.Splash_v1,
    [Swap.Protocol.Teddy_v1]: Dex.Unsupported,
    [Swap.Protocol.Muesliswap_v2]: Dex.Muesliswap_v2,
    [Swap.Protocol.Muesliswap_clp]: Dex.Muesliswap_clp,
    [Swap.Protocol.Spectrum_v1]: Dex.Unsupported,
    [Swap.Protocol.Unsupported]: Dex.Unsupported,
  }[dex] ?? Dex.Unsupported)

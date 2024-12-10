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
  Provider,
  ReverseEstimateRequest,
  ReverseEstimateResponse,
  SignRequest,
  SignResponse,
  Split,
  TokensResponse,
} from './types'
import {isPrimaryToken} from '@yoroi/portfolio'
import {DexhunterApiConfig} from './api-maker'
import {SwapProvider} from '@yoroi/types/lib/typescript/swap/api'

const tokenIdToDexhunter = (tokenId: Portfolio.Token.Id) =>
  isPrimaryToken(tokenId) ? 'ADA' : tokenId.replace('.', '')

const transformSplit = ({
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
  dex: toSwapProvider(dex),
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
}: DexhunterApiConfig) => {
  const tokenIdFromDexhunter = (tokenId: string): Portfolio.Token.Id =>
    tokenId ===
    '000000000000000000000000000000000000000000000000000000006c6f76656c616365'
      ? primaryTokenInfo.id
      : `${tokenId.slice(0, 56)}.${tokenId.slice(56)}`

  return {
    tokens: {
      response: (res: TokensResponse): Array<Portfolio.Token.Info> =>
        res.map(
          ({
            token_id,
            token_decimals,
            token_ascii,
            ticker,
            is_verified,
            supply,
            creation_date,
            price,
          }) => {
            if (
              token_id ===
              '000000000000000000000000000000000000000000000000000000006c6f76656c616365'
            )
              return primaryTokenInfo
            return {
              id: tokenIdFromDexhunter(token_id),
              type: Portfolio.Token.Type.FT,
              nature: Portfolio.Token.Nature.Secondary,
              decimals: token_decimals ?? 0,
              ticker: ticker ?? '',
              name: token_ascii ?? '',
              symbol: ticker ?? '',
              status: is_verified
                ? Portfolio.Token.Status.Valid
                : Portfolio.Token.Status.Unknown,
              application: Portfolio.Token.Application.General,
              tag: '',
              reference: '',
              fingerprint: '',
              description: `${price}, ${supply}, ${creation_date}`,
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
            actual_out_amount = 0,
            amount_in = 0,
            dex,
            expected_out_amount = 0,
            is_dexhunter = false,
            last_update,
            status = '',
            submission_time,
            token_id_in = '',
            token_id_out = '',
            tx_hash = '',
            update_tx_hash = '',
            output_index,
          }) => ({
            aggregator: is_dexhunter
              ? Swap.Aggregator.Dexhunter
              : Swap.Aggregator.Muesliswap,
            dex: toSwapProvider(dex),
            placedAt: new Date(submission_time).getTime(),
            lastUpdate: new Date(last_update).getTime(),
            status,
            tokenIn: tokenIdFromDexhunter(token_id_in),
            tokenOut: tokenIdFromDexhunter(token_id_out),
            amountIn: amount_in,
            actualAmountOut: actual_out_amount,
            expectedAmountOut: expected_out_amount,
            txHash: tx_hash,
            outputIndex: output_index,
            updateTxHash: update_tx_hash,
            customId: _id,
          }),
        ),
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
        blacklistedDexes,
        slippage,
        tokenIn,
        tokenOut,
      }: Swap.EstimateRequest): EstimateRequest => ({
        amount_in: amountIn,
        blacklisted_dexes: blacklistedDexes
          ?.map(fromSwapProvider)
          .filter((v): v is Provider => !!v),
        slippage,
        token_in: tokenIdToDexhunter(tokenIn),
        token_out: tokenIdToDexhunter(tokenOut),
      }),
      response: ({
        batcher_fee = 0,
        deposits = 0,
        dexhunter_fee = 0,
        net_price = 0,
        partner_fee = 0,
        splits,
        total_fee = 0,
        total_output = 0,
        total_output_without_slippage = 0,
      }: EstimateResponse): Swap.EstimateResponse => ({
        splits: splits?.map(transformSplit) ?? [],
        batcherFee: batcher_fee,
        deposits,
        aggregatorFee: dexhunter_fee,
        frontendFee: partner_fee,
        netPrice: net_price,
        totalFee: total_fee,
        totalOutput: total_output,
        totalOutputWithoutSlippage: total_output_without_slippage,
      }),
    },
    reverseEstimate: {
      request: ({
        amountOut,
        blacklistedDexes,
        slippage,
        tokenIn,
        tokenOut,
      }: Swap.EstimateRequest): ReverseEstimateRequest => ({
        amount_out: amountOut,
        blacklisted_dexes: blacklistedDexes
          ?.map(fromSwapProvider)
          .filter((v): v is Provider => !!v),
        slippage,
        token_in: tokenIdToDexhunter(tokenIn),
        token_out: tokenIdToDexhunter(tokenOut),
      }),
      response: ({
        batcher_fee = 0,
        deposits = 0,
        dexhunter_fee = 0,
        net_price = 0,
        partner_fee = 0,
        splits,
        total_fee = 0,
        total_input = 0,
        total_output = 0,
      }: ReverseEstimateResponse): Swap.EstimateResponse => ({
        splits: splits?.map(transformSplit) ?? [],
        batcherFee: batcher_fee,
        deposits,
        aggregatorFee: dexhunter_fee,
        frontendFee: partner_fee,
        netPrice: net_price,
        totalFee: total_fee,
        totalOutput: total_output,
        totalInput: total_input,
      }),
    },
    limitEstimate: {
      request: ({
        amountIn,
        blacklistedDexes,
        dex = SwapProvider.Splash_v1,
        multiples,
        tokenIn,
        tokenOut,
        wantedPrice,
      }: Swap.EstimateRequest): LimitEstimateRequest => ({
        amount_in: amountIn,
        blacklisted_dexes: blacklistedDexes
          ?.map(fromSwapProvider)
          .filter((v): v is Provider => !!v),
        dex: fromSwapProvider(dex) ?? Provider.Splash_v1,
        multiples,
        token_in: tokenIdToDexhunter(tokenIn),
        token_out: tokenIdToDexhunter(tokenOut),
        wanted_price: wantedPrice,
      }),
      response: ({
        batcher_fee = 0,
        deposits = 0,
        dexhunter_fee = 0,
        net_price = 0,
        partner_fee = 0,
        splits,
        total_fee = 0,
        total_input = 0,
        total_output = 0,
      }: LimitEstimateResponse): Swap.EstimateResponse => ({
        splits: splits?.map(transformSplit) ?? [],
        batcherFee: batcher_fee,
        deposits,
        aggregatorFee: dexhunter_fee,
        frontendFee: partner_fee,
        netPrice: net_price,
        totalFee: total_fee,
        totalOutput: total_output,
        totalInput: total_input,
      }),
    },
    limitBuild: {
      request: ({
        amountIn,
        blacklistedDexes,
        dex = Swap.Provider.Splash_v1,
        multiples,
        tokenIn,
        tokenOut,
        wantedPrice,
      }: Swap.CreateRequest): LimitBuildRequest => ({
        amount_in: amountIn,
        blacklisted_dexes: blacklistedDexes
          ?.map(fromSwapProvider)
          .filter((v): v is Provider => !!v),
        buyer_address: address,
        dex: fromSwapProvider(dex) ?? Provider.Splash_v1,
        multiples,
        token_in: tokenIdToDexhunter(tokenIn),
        token_out: tokenIdToDexhunter(tokenOut),
        wanted_price: wantedPrice,
      }),
      response: ({
        cbor = '',
        batcher_fee = 0,
        deposits = 0,
        dexhunter_fee = 0,
        partner_fee = 0,
        splits,
        totalFee = 0,
        total_input = 0,
        total_output = 0,
      }: LimitBuildResponse): Swap.CreateResponse => ({
        aggregator: Swap.Aggregator.Dexhunter,
        cbor,
        splits: splits?.map(transformSplit) ?? [],
        batcherFee: batcher_fee,
        deposits,
        aggregatorFee: dexhunter_fee,
        frontendFee: partner_fee,
        totalFee: totalFee,
        totalInput: total_input,
        totalOutput: total_output,
      }),
    },
    build: {
      request: ({
        amountIn,
        blacklistedDexes,
        slippage = 0,
        tokenIn,
        tokenOut,
      }: Swap.CreateRequest): BuildRequest => ({
        amount_in: amountIn,
        blacklisted_dexes: blacklistedDexes
          ?.map(fromSwapProvider)
          .filter((v): v is Provider => v !== undefined),
        buyer_address: address,
        slippage,
        token_in: tokenIdToDexhunter(tokenIn),
        token_out: tokenIdToDexhunter(tokenOut),
      }),
      response: ({
        cbor = '',
        batcher_fee = 0,
        deposits = 0,
        dexhunter_fee = 0,
        net_price = 0,
        partner_fee = 0,
        splits,
        total_fee = 0,
        total_input = 0,
        total_output = 0,
        total_output_without_slippage = 0,
      }: BuildResponse): Swap.CreateResponse => ({
        aggregator: Swap.Aggregator.Dexhunter,
        cbor,
        splits: splits?.map(transformSplit) ?? [],
        batcherFee: batcher_fee,
        deposits,
        aggregatorFee: dexhunter_fee,
        frontendFee: partner_fee,
        netPrice: net_price,
        totalFee: total_fee,
        totalInput: total_input,
        totalOutput: total_output,
        totalOutputWithoutSlippage: total_output_without_slippage,
      }),
    },
    sign: {
      request: ({signatures, txCbor}: any): SignRequest => ({
        Signatures: signatures,
        txCbor,
      }),
      response: ({cbor, strat_id}: SignResponse) => ({cbor, stratId: strat_id}),
    },
  } as const
}

const toSwapProvider = (dex: Provider): Swap.Provider =>
  ({
    [Provider.Minswap_v1]: Swap.Provider.Minswap_v1,
    [Provider.Minswap_v2]: Swap.Provider.Minswap_v2,
    [Provider.Wingriders_v1]: Swap.Provider.Wingriders_v1,
    [Provider.Wingriders_v2]: Swap.Provider.Wingriders_v2,
    [Provider.Vyfi_v1]: Swap.Provider.Vyfi_v1,
    [Provider.Sundaeswap_v1]: Swap.Provider.Sundaeswap_v1,
    [Provider.Sundaeswap_v3]: Swap.Provider.Sundaeswap_v3,
    [Provider.Splash_v1]: Swap.Provider.Splash_v1,
  }[dex])

const fromSwapProvider = (dex: Swap.Provider): Provider | undefined =>
  ({
    [Swap.Provider.Minswap_v1]: Provider.Minswap_v1,
    [Swap.Provider.Minswap_v2]: Provider.Minswap_v2,
    [Swap.Provider.Wingriders_v1]: Provider.Wingriders_v1,
    [Swap.Provider.Wingriders_v2]: Provider.Wingriders_v2,
    [Swap.Provider.Vyfi_v1]: Provider.Vyfi_v1,
    [Swap.Provider.Sundaeswap_v1]: Provider.Sundaeswap_v1,
    [Swap.Provider.Sundaeswap_v3]: Provider.Sundaeswap_v3,
    [Swap.Provider.Splash_v1]: Provider.Splash_v1,
    [Swap.Provider.Teddy_v1]: undefined,
    [Swap.Provider.Muesliswap_v2]: undefined,
    [Swap.Provider.Spectrum_v1]: undefined,
  }[dex])

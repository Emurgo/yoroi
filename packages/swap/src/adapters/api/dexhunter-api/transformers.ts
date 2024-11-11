import {Portfolio} from '@yoroi/types'
import {isPrimaryToken} from '@yoroi/portfolio'
import {freeze} from 'immer'

import {DexHunterApi} from './types'

const tokenIdToDexhunter = (tokenId: Portfolio.Token.Id) =>
  isPrimaryToken(tokenId) ? 'ADA' : tokenId.replace('.', '')

const tokenIdFromDexhunter = (
  tokenId: string,
  tokenPolicy: string,
): Portfolio.Token.Id =>
  `${tokenPolicy}.${tokenId?.slice(tokenPolicy.length) ?? ''}`

export const transformers = freeze(
  {
    tokenIdFromDexhunter,
    tokenIdToDexhunter,
    tokens: {
      response: (
        response: Readonly<DexHunterApi.TokensResponse>,
      ): ReadonlyArray<Portfolio.Token.Info> =>
        freeze(
          response.map(
            ({
              token_id,
              token_decimals,
              token_policy,
              token_ascii,
              ticker,
              is_verified,
              supply,
              creation_date,
              price,
            }) => ({
              id: tokenIdFromDexhunter(token_id, token_policy),
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
            }),
          ),
          true,
        ),
    },
    averagePrice: {
      request: ({
        tokenInId,
        tokenOutId,
      }: Readonly<DexHunterApi.AveragePriceArgs>) =>
        freeze({
          tokenInId: tokenIdToDexhunter(tokenInId),
          tokenOutId: tokenIdToDexhunter(tokenOutId),
        }),
      response: (data: Readonly<DexHunterApi.AveragePriceResponse>) =>
        data.averagePrice,
    },
    cancel: {
      request: ({
        address,
        orderId,
      }: Readonly<DexHunterApi.CancelArgs>): Readonly<DexHunterApi.CancelRequest> =>
        freeze({
          address,
          order_id: orderId,
        }),
      response: ({
        additional_cancellation_fee,
        cbor,
      }: Readonly<DexHunterApi.CancelResponse>) =>
        freeze({
          cbor,
          cancellationFee: additional_cancellation_fee,
        }),
    },
    estimate: {
      request: ({
        amountIn,
        blacklistedDexes,
        singlePreferredDex,
        slippage,
        tokenIn,
        tokenOut,
      }: Readonly<DexHunterApi.EstimateArgs>): Readonly<DexHunterApi.EstimateRequest> =>
        freeze({
          amount_in: amountIn,
          blacklisted_dexes: blacklistedDexes,
          single_preferred_dex: singlePreferredDex,
          slippage,
          token_in: tokenIdToDexhunter(tokenIn),
          token_out: tokenIdToDexhunter(tokenOut),
        }),
      response: ({
        average_price,
        batcher_fee,
        communications,
        deposits,
        dexhunter_fee,
        net_price,
        net_price_reverse,
        partner_code,
        partner_fee,
        possible_routes,
        splits,
        total_fee,
        total_output,
        total_output_without_slippage,
      }: Readonly<DexHunterApi.EstimateResponse>) =>
        freeze({
          averagePrice: average_price,
          batcherFee: batcher_fee,
          communications,
          deposits,
          dexhunterFee: dexhunter_fee,
          netPrice: net_price,
          netPriceReverse: net_price_reverse,
          partnerCode: partner_code,
          partnerFee: partner_fee,
          possibleRoutes: possible_routes,
          splits,
          totalFee: total_fee,
          totalOutput: total_output,
          totalOutputWithoutSlippage: total_output_without_slippage,
        }),
    },
    reverseEstimate: {
      request: ({
        amountOut,
        blacklistedDexes,
        address,
        isOptimized,
        slippage,
        tokenIn,
        tokenOut,
      }: Readonly<DexHunterApi.ReverseEstimateArgs>): Readonly<DexHunterApi.ReverseEstimateRequest> =>
        freeze({
          amount_out: amountOut,
          blacklisted_dexes: blacklistedDexes,
          buyer_address: address,
          is_optimized: isOptimized,
          slippage,
          token_in: tokenIdToDexhunter(tokenIn),
          token_out: tokenIdToDexhunter(tokenOut),
        }),
      response: ({
        average_price,
        batcher_fee,
        communications,
        deposits,
        dexhunter_fee,
        net_price,
        net_price_reverse,
        partner_fee,
        possible_routes,
        price_ab,
        price_ba,
        splits,
        total_fee,
        total_input,
        total_input_without_slippage,
        total_output,
      }: Readonly<DexHunterApi.ReverseEstimateResponse>) =>
        freeze({
          averagePrice: average_price,
          batcherFee: batcher_fee,
          communications,
          deposits,
          dexhunterFee: dexhunter_fee,
          netPrice: net_price,
          netPriceReverse: net_price_reverse,
          partnerFee: partner_fee,
          possibleRoutes: possible_routes,
          priceAB: price_ab,
          priceBA: price_ba,
          splits,
          totalFee: total_fee,
          totalInput: total_input,
          totalInputWithoutSlippage: total_input_without_slippage,
          totalOutput: total_output,
        }),
    },
    limit: {
      request: ({
        amountIn,
        blacklistedDexes,
        address,
        dex,
        multiples,
        tokenIn,
        tokenOut,
        wantedPrice,
      }: Readonly<DexHunterApi.LimitOrderArgs>): Readonly<DexHunterApi.LimitOrderRequest> =>
        freeze({
          amount_in: amountIn,
          blacklisted_dexes: blacklistedDexes,
          buyer_address: address,
          dex: dex,
          multiples,
          token_in: tokenIdToDexhunter(tokenIn),
          token_out: tokenIdToDexhunter(tokenOut),
          wanted_price: wantedPrice,
        }),
      response: ({
        batcher_fee,
        cbor,
        deposits,
        dexhunter_fee,
        partner,
        partner_fee,
        possible_routes,
        splits,
        totalFee,
        total_input,
        total_output,
      }: Readonly<DexHunterApi.LimitOrderResponse>) =>
        freeze({
          batcherFee: batcher_fee,
          cbor,
          deposits,
          dexhunterFee: dexhunter_fee,
          partner,
          partnerFee: partner_fee,
          possibleRoutes: possible_routes,
          splits,
          totalFee,
          totalInput: total_input,
          totalOutput: total_output,
        }),
    },
    limitEstimate: {
      request: ({
        amountIn,
        blacklistedDexes,
        address,
        dex,
        multiples,
        tokenIn,
        tokenOut,
        wantedPrice,
      }: DexHunterApi.LimitOrderArgs): DexHunterApi.LimitOrderRequest =>
        freeze({
          amount_in: amountIn,
          blacklisted_dexes: blacklistedDexes,
          buyer_address: address,
          dex: dex,
          multiples,
          token_in: tokenIdToDexhunter(tokenIn),
          token_out: tokenIdToDexhunter(tokenOut),
          wanted_price: wantedPrice,
        }),
      response: ({
        batcher_fee,
        blacklisted_dexes,
        deposits,
        dexhunter_fee,
        net_price,
        partner,
        partner_fee,
        possible_routes,
        splits,
        total_fee,
        total_input,
        total_output,
      }: Readonly<DexHunterApi.LimitOrderEstimate>) =>
        freeze({
          batcherFee: batcher_fee,
          blacklistedDexes: blacklisted_dexes,
          deposits,
          dexhunterFee: dexhunter_fee,
          netPrice: net_price,
          partner,
          partnerFee: partner_fee,
          possibleRoutes: possible_routes,
          splits,
          totalFee: total_fee,
          totalInput: total_input,
          totalOutput: total_output,
        }),
    },
    orders: {
      request: ({address}: Readonly<DexHunterApi.OrdersArgs>) =>
        freeze({
          userAddress: address,
        }),
    },
    sign: {
      request: ({
        signatures,
        txCbor,
      }: Readonly<DexHunterApi.SignArgs>): Readonly<DexHunterApi.SignRequest> =>
        freeze({
          Signatures: signatures,
          txCbor,
        }),
      response: ({cbor, strat_id}: DexHunterApi.SignResponse) =>
        freeze({
          cbor,
          stratId: strat_id,
        }),
    },
    swap: {
      request: ({
        amountIn,
        blacklistedDexes,
        address,
        inputs,
        slippage,
        tokenIn,
        tokenOut,
      }: Readonly<DexHunterApi.SwapArgs>): Readonly<DexHunterApi.SwapRequest> =>
        freeze({
          amount_in: amountIn,
          blacklisted_dexes: blacklistedDexes,
          buyer_address: address,
          inputs,
          slippage,
          token_in: tokenIdToDexhunter(tokenIn),
          token_out: tokenIdToDexhunter(tokenOut),
        }),
      response: ({
        average_price,
        batcher_fee,
        cbor,
        communications,
        deposits,
        dexhunter_fee,
        net_price,
        net_price_reverse,
        partner_code,
        partner_fee,
        possible_routes,
        splits,
        total_fee,
        total_input,
        total_input_without_slippage,
        total_output,
        total_output_without_slippage,
      }: Readonly<DexHunterApi.SwapResponse>) =>
        freeze({
          averagePrice: average_price,
          batcherFee: batcher_fee,
          cbor,
          communications,
          deposits,
          dexhunterFee: dexhunter_fee,
          netPrice: net_price,
          netPriceReverse: net_price_reverse,
          partnerCode: partner_code,
          partnerFee: partner_fee,
          possibleRoutes: possible_routes,
          splits,
          totalFee: total_fee,
          totalInput: total_input,
          totalInputWithoutSlippage: total_input_without_slippage,
          totalOutput: total_output,
          totalOutputWithoutSlippage: total_output_without_slippage,
        }),
    },
  } as const,
  true,
)

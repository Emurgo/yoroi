import {Portfolio, Swap} from '@yoroi/types'

import {
  CancelRequest,
  CancelResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  Dex,
  LimitOrderRequest,
  LimitOrderResponse,
  LimitQuoteRequest,
  MuesliswapApiConfig,
  OrdersHistoryResponse,
  QuoteRequest,
  QuoteResponse,
  Split,
  TokensResponse,
} from './types'

export const transformersMaker = ({
  primaryTokenInfo,
  address,
  partner,
}: MuesliswapApiConfig) => {
  // cache for providers payload to enrich splits with image URLs
  let providersCache: any | null = null
  const getProviderImage = (dex: string): string | undefined => {
    const dexInfo = providersCache?.dex_info?.[dex]
    return typeof dexInfo?.image === 'string' ? dexInfo.image : undefined
  }
  return {
    // allow api-maker to inject providers payload
    __setProviders: (payload: any) => {
      providersCache = payload
    },
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
        order_ids: [`${order.txHash}#${order.outputIndex ?? 0}`],
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
        routeHint,
      }: Swap.EstimateRequest & {routeHint?: any}): LimitQuoteRequest => {
        // Prefer routeHint.orderContract, else map from protocol; avoid 'unsupported' or generic
        const hintContract: Dex | undefined = routeHint?.orderContract as
          | Dex
          | undefined
        const mapped = protocol ? fromSwapProtocol(protocol) : undefined
        const normalized =
          mapped === Dex.Muesliswap ? Dex.Muesliswap_v2 : mapped
        const order_contract =
          hintContract && hintContract !== Dex.Unsupported
            ? hintContract
            : normalized && normalized !== Dex.Unsupported
              ? normalized
              : undefined

        return {
          numbers_have_decimals: true,
          sell_token: tokenIn,
          buy_token: tokenOut,
          sell_amount: String(amountIn),
          ...(partner !== undefined && {partner}),
          buy_amount: String(amountIn * wantedPrice),
          order_contract,
          pool_id: routeHint?.poolIds?.[0] ?? undefined,
        }
      },
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
      }: Swap.EstimateRequest & {
        routeHint?: {frontendOptions?: string[]}
      }): QuoteRequest => {
        // compute excluded_sources from Frontend Options when protocol is pinned and providers are available
        let excluded_sources: ReadonlyArray<Dex> | Dex | undefined
        if (
          protocol !== undefined &&
          providersCache?.dex_info &&
          providersCache?.liquidity_source_info
        ) {
          const orderContract = fromSwapProtocol(protocol)
          // find dex_info entry by matching key or scanning values
          const dexEntry = providersCache.dex_info[orderContract]
          if (dexEntry && Array.isArray(dexEntry.liquidity_protocols)) {
            const allowedFO = dexEntry.liquidity_protocols
              .map(
                (lp: string) =>
                  providersCache.liquidity_source_info?.[lp]?.frontend_option,
              )
              .filter((v: any) => typeof v === 'string')
            const allFO = Object.values(
              providersCache.liquidity_source_info ?? {},
            )
              .map((v: any) => v?.frontend_option)
              .filter((v: any) => typeof v === 'string')
            const excludedFO = allFO.filter(
              (fo: string) => !allowedFO.includes(fo),
            )
            excluded_sources = excludedFO as any
          }
        }

        if (excluded_sources === undefined) {
          if (providersCache?.liquidity_source_info && blockedProtocols) {
            const mappedFO = blockedProtocols
              .map(fromSwapProtocol)
              .map(
                (dex) =>
                  (providersCache.liquidity_source_info as any)?.[dex]
                    ?.frontend_option,
              )
              .filter((v): v is string => typeof v === 'string')
            excluded_sources =
              mappedFO.length > 0 ? (mappedFO as any) : undefined
          } else if (protocol !== undefined) {
            // Avoid sending invalid providers (e.g., 'muesliswap') when FO mapping is unavailable
            excluded_sources = undefined
          } else {
            excluded_sources = undefined
          }
        }

        return {
          numbers_have_decimals: true,
          sell_token: tokenIn,
          buy_token: tokenOut,
          ...(amountOut !== undefined && {buy_amount: String(amountOut)}),
          ...(amountIn !== undefined && {sell_amount: String(amountIn)}),
          ...(partner !== undefined && {partner}),
          // muesli expects slippage as a percentage
          slippage: slippage / 100,
          excluded_sources,
        }
      },
      response: ({
        buy_token_decimals,
        sell_token_decimals,
        net_price,
        net_price_impact,
        splits,
        total_batcher_fee,
        total_deposit,
        total_input,
        service_fee,
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
          (Number(total_batcher_fee) + Number(service_fee)).toFixed(
            primaryTokenInfo.decimals,
          ),
        ),
        totalInput: Number(total_input),
        totalOutput: Number(total_output),
        totalOutputWithoutSlippage:
          total_output_without_slippage === undefined
            ? undefined
            : Number(total_output_without_slippage),
        splits: splits.map((sp) => {
          const s = toSwapSplit(sp)
          const image = getProviderImage(sp.dex)
          return image ? {...s, aggregatorImageUrl: image} : s
        }),
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
        routeHint,
      }: Swap.CreateRequest): CreateOrderRequest => {
        // Compute excluded_sources using Frontend Options when possible to avoid invalid provider keys
        let excluded_sources: ReadonlyArray<Dex> | Dex | undefined
        if (providersCache?.liquidity_source_info) {
          let allowedFO: string[] | undefined
          // Prefer explicit hint from UI
          if (routeHint && Array.isArray((routeHint as any).frontendOptions)) {
            allowedFO = (routeHint as any).frontendOptions as string[]
          } else if (
            routeHint &&
            typeof (routeHint as any).aggregatorDexKey === 'string'
          ) {
            // Fall back to the chosen split's provider key (FO) when available
            allowedFO = [(routeHint as any).aggregatorDexKey as string]
          } else if (protocol !== undefined) {
            const mapped = fromSwapProtocol(protocol)
            const fo = (providersCache.liquidity_source_info as any)?.[mapped]
              ?.frontend_option
            if (typeof fo === 'string') allowedFO = [fo]
          }

          if (allowedFO && allowedFO.length > 0) {
            const allFO = Object.values(
              providersCache.liquidity_source_info ?? {},
            )
              .map((v: any) => v?.frontend_option)
              .filter((v: any) => typeof v === 'string')
            const excludedFO = allFO.filter(
              (fo: string) => !allowedFO!.includes(fo),
            )
            excluded_sources = excludedFO as any
          } else if (blockedProtocols) {
            const mappedFO = blockedProtocols
              .map(fromSwapProtocol)
              .map(
                (dex) =>
                  (providersCache.liquidity_source_info as any)?.[dex]
                    ?.frontend_option,
              )
              .filter((v): v is string => typeof v === 'string')
            if (mappedFO.length > 0) excluded_sources = mappedFO as any
          }
        }

        return {
          numbers_have_decimals: true,
          sell_token: tokenIn,
          buy_token: tokenOut,
          sell_amount: String(amountIn),
          user_address: address,
          ...(partner !== undefined && {partner}),
          slippage: slippage / 100,
          excluded_sources,
          utxos: inputs,
        }
      },
      response: ({
        quote: {
          buy_token_decimals,
          sell_token_decimals,
          net_price,
          net_price_impact,
          splits,
          service_fee,
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
        frontendFee: Number(service_fee),
        cbor: tx_cbor,
        netPrice: net_price * 10 ** (sell_token_decimals - buy_token_decimals),
        priceImpact: net_price_impact,
        batcherFee: Number(total_batcher_fee),
        deposits: Number(total_deposit),
        totalFee: Number(
          (Number(total_batcher_fee) + Number(service_fee)).toFixed(
            primaryTokenInfo.decimals,
          ),
        ),
        totalInput: Number(total_input),
        totalOutput: Number(total_output),
        totalOutputWithoutSlippage: Number(total_output_without_slippage),
        splits: splits.map((sp) => {
          const s = toSwapSplit(sp)
          const image = getProviderImage(sp.dex)
          return image ? {...s, aggregatorImageUrl: image} : s
        }),
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
        routeHint,
      }: Swap.CreateRequest): LimitOrderRequest => {
        const hintContract: Dex | undefined = routeHint?.orderContract as
          | Dex
          | undefined
        const mapped = fromSwapProtocol(protocol)
        const normalized =
          mapped === Dex.Muesliswap ? Dex.Muesliswap_v2 : mapped
        const order_contract =
          hintContract && hintContract !== Dex.Unsupported
            ? hintContract
            : normalized && normalized !== Dex.Unsupported
              ? normalized
              : undefined

        return {
          order_contract,
          buy_amount: String(amountIn * wantedPrice),
          ...(partner !== undefined && {partner}),

          numbers_have_decimals: true,
          sell_token: tokenIn,
          buy_token: tokenOut,
          sell_amount: String(amountIn),
          user_address: address,
          utxos: inputs,
          pool_id: routeHint?.poolIds?.[0] ?? undefined,
        }
      },
      response: ({
        quote: {
          buy_token_decimals,
          sell_token_decimals,
          net_price,
          net_price_impact,
          splits,
          service_fee,
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
        frontendFee: Number(service_fee),
        netPrice: net_price * 10 ** (sell_token_decimals - buy_token_decimals),
        priceImpact: net_price_impact,
        batcherFee: Number(total_batcher_fee),
        deposits: Number(total_deposit),
        totalFee: Number(
          (Number(total_batcher_fee) + Number(service_fee)).toFixed(
            primaryTokenInfo.decimals,
          ),
        ),
        totalInput: Number(total_input),
        totalOutput: Number(total_output),
        totalOutputWithoutSlippage: Number(total_output_without_slippage),
        splits: splits.map((sp) => {
          const s = toSwapSplit(sp)
          const image = getProviderImage(sp.dex)
          return image ? {...s, aggregatorImageUrl: image} : s
        }),
      }),
    },
  } as const
}

// Note: getProviderImage is closed over from transformersMaker scope
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
  aggregator: Swap.Aggregator.Muesliswap,
  aggregatorDexKey: dex,
  aggregatorPoolId: source_id,
})

export const toSwapProtocol = (dex: Dex): Swap.Protocol =>
  ({
    [Dex.Muesliswap]: Swap.Protocol.Muesliswap_v2,
    [Dex.Muesliswap_v1]: Swap.Protocol.Muesliswap_v1,
    [Dex.Muesliswap_v2]: Swap.Protocol.Muesliswap_v2,
    [Dex.Muesliswap_clp]: Swap.Protocol.Muesliswap_clp,
    [Dex.Muesliswap_orderbook]: Swap.Protocol.Muesliswap_orderbook,
    [Dex.Minswap_v1]: Swap.Protocol.Minswap_v1,
    [Dex.Minswap_v2]: Swap.Protocol.Minswap_v2,
    [Dex.Minswap_stable]: Swap.Protocol.Minswap_stable,
    [Dex.Wingriders_v1]: Swap.Protocol.Wingriders_v1,
    [Dex.Wingriders_v2]: Swap.Protocol.Wingriders_v2,
    [Dex.Wingriders_stable]: Swap.Protocol.Wingriders_stable,
    [Dex.Vyfi_v1]: Swap.Protocol.Vyfi_v1,
    [Dex.Sundaeswap_v1]: Swap.Protocol.Sundaeswap_v1,
    [Dex.Sundaeswap_v3]: Swap.Protocol.Sundaeswap_v3,
    [Dex.Cswap_v1]: Swap.Protocol.Cswap,
    [Dex.Splash_v4]: Swap.Protocol.Splash_v4,
    [Dex.Splash_v5]: Swap.Protocol.Splash_v5,
    [Dex.Splash_v6]: Swap.Protocol.Splash_v6,
    [Dex.Splash_degen_quad]: Swap.Protocol.Snekfun,
    [Dex.Spectrum_v1]: Swap.Protocol.Spectrum_v1,
    [Dex.Teddy_v1]: Swap.Protocol.Teddy_v1,
    [Dex.Unsupported]: Swap.Protocol.Unsupported,
  })[dex] ?? Swap.Protocol.Unsupported

export const fromSwapProtocol = (dex: Swap.Protocol): Dex =>
  ({
    [Swap.Protocol.Muesliswap]: Dex.Muesliswap,
    [Swap.Protocol.Cswap]: Dex.Cswap_v1,
    [Swap.Protocol.Minswap_v1]: Dex.Minswap_v1,
    [Swap.Protocol.Minswap_v2]: Dex.Minswap_v2,
    [Swap.Protocol.Minswap_stable]: Dex.Minswap_stable,
    [Swap.Protocol.Muesliswap_v1]: Dex.Muesliswap_v1,
    [Swap.Protocol.Muesliswap_v2]: Dex.Muesliswap_v2,
    [Swap.Protocol.Muesliswap_clp]: Dex.Muesliswap_clp,
    [Swap.Protocol.Muesliswap_orderbook]: Dex.Muesliswap_orderbook,
    [Swap.Protocol.Wingriders_v1]: Dex.Wingriders_v1,
    [Swap.Protocol.Wingriders_v2]: Dex.Wingriders_v2,
    [Swap.Protocol.Wingriders_stable]: Dex.Wingriders_stable,
    [Swap.Protocol.Vyfi_v1]: Dex.Vyfi_v1,
    [Swap.Protocol.Sundaeswap_v1]: Dex.Sundaeswap_v1,
    [Swap.Protocol.Sundaeswap_v3]: Dex.Sundaeswap_v3,
    [Swap.Protocol.Splash_v1]: Dex.Unsupported,
    [Swap.Protocol.Splash_v4]: Dex.Splash_v4,
    [Swap.Protocol.Splash_v5]: Dex.Splash_v5,
    [Swap.Protocol.Splash_v6]: Dex.Splash_v6,
    [Swap.Protocol.Snekfun]: Dex.Splash_degen_quad,
    [Swap.Protocol.Teddy_v1]: Dex.Teddy_v1,
    [Swap.Protocol.Spectrum_v1]: Dex.Spectrum_v1,
    [Swap.Protocol.Chadswap]: Dex.Unsupported,
    [Swap.Protocol.Cerra]: Dex.Unsupported,
    [Swap.Protocol.Genius]: Dex.Unsupported,
    [Swap.Protocol.Unsupported]: Dex.Unsupported,
  })[dex] ?? Dex.Unsupported

export const MuesliswapProtocols = Object.values(Dex)
  .filter((p) => p !== Dex.Unsupported)
  .map(toSwapProtocol)

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
  ProviderInfoResponse,
  QuoteRequest,
  QuoteResponse,
  RouteHint,
  Split,
  TokensResponse,
} from './types'

export const transformersMaker = ({
  primaryTokenInfo,
  address,
  partner,
}: MuesliswapApiConfig) => {
  // cache for providers payload to enrich splits with image URLs
  let providersCache: ProviderInfoResponse | null = null
  // helper to compute excluded_sources (Frontend Options) from protocol, blockedProtocols and optional route hints
  const computeExcludedSources = ({
    protocol,
    blockedProtocols,
    routeHint,
  }: {
    protocol?: Swap.Protocol
    blockedProtocols?: ReadonlyArray<Swap.Protocol>
    routeHint?: RouteHint
  }): ReadonlyArray<string> | undefined => {
    if (providersCache === null || !providersCache.liquidity_source_info)
      return undefined

    const cache = providersCache

    let allowedFO: ReadonlyArray<string> | undefined
    if (routeHint && Array.isArray(routeHint.frontendOptions)) {
      allowedFO = routeHint.frontendOptions
    } else if (routeHint && typeof routeHint.aggregatorDexKey === 'string') {
      allowedFO = [routeHint.aggregatorDexKey]
    } else if (
      protocol !== undefined &&
      cache.dex_info &&
      cache.liquidity_source_info
    ) {
      const orderContract = fromSwapProtocol(protocol)
      const dexEntry = cache.dex_info[orderContract]
      if (dexEntry && Array.isArray(dexEntry.liquidity_protocols)) {
        allowedFO = dexEntry.liquidity_protocols
          .map((lp: string) => cache.liquidity_source_info[lp]?.frontend_option)
          .filter((v): v is string => typeof v === 'string')
      }
    }

    if (allowedFO && allowedFO.length > 0) {
      const allFO = (
        Object.values(cache.liquidity_source_info) as Array<{
          frontend_option: string
        }>
      )
        .map((v) => v.frontend_option)
        .filter((v): v is string => typeof v === 'string')
      const excludedFO = allFO.filter((fo: string) => !allowedFO!.includes(fo))
      return excludedFO
    }

    if (blockedProtocols && blockedProtocols.length > 0) {
      const mappedFO = blockedProtocols
        .map(fromSwapProtocol)
        .map((dex) => cache.liquidity_source_info[dex]?.frontend_option)
        .filter((v): v is string => typeof v === 'string')
      return mappedFO.length > 0 ? mappedFO : undefined
    }

    return undefined
  }
  const mapProtocolToOrderContract = ({
    protocol,
    routeHint,
  }: {
    protocol?: Swap.Protocol
    routeHint?: RouteHint
  }): Dex | undefined => {
    const raw = routeHint?.orderContract
    const hintContract: Dex | undefined =
      raw !== undefined && Object.values(Dex).includes(raw as Dex)
        ? (raw as Dex)
        : undefined
    const mapped = protocol ? fromSwapProtocol(protocol) : undefined
    const normalized = mapped === Dex.Muesliswap ? Dex.Muesliswap_v2 : mapped
    if (hintContract && hintContract !== Dex.Unsupported) return hintContract
    if (normalized && normalized !== Dex.Unsupported) return normalized
    return undefined
  }
  return {
    // allow api-maker to inject providers payload
    setProviders: (payload: ProviderInfoResponse) => {
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
      }: Swap.EstimateRequest): LimitQuoteRequest => {
        // Map protocol to order contract; omit if unsupported/undefined
        const order_contract = mapProtocolToOrderContract({
          protocol,
          routeHint: undefined,
        })

        return {
          numbers_have_decimals: true,
          sell_token: tokenIn,
          buy_token: tokenOut,
          sell_amount: String(amountIn),
          ...(partner !== undefined && {partner}),
          buy_amount: String(amountIn * wantedPrice),
          order_contract,
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
        const excluded_sources = computeExcludedSources({
          protocol,
          blockedProtocols,
          routeHint: undefined,
        })

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
        splits: splits.map((sp) => toSwapSplit(sp, providersCache)),
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
        const excluded_sources = computeExcludedSources({
          protocol,
          blockedProtocols,
          routeHint,
        })

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
        splits: splits.map((sp) => toSwapSplit(sp, providersCache)),
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
        // For multi-hop swaps (multiple pool IDs), don't send pool_id
        const isMultiHop = routeHint?.poolIds && routeHint.poolIds.length > 1
        // Mutually exclusive: prefer pool_id when provided, otherwise use order_contract
        const pool_id = isMultiHop ? undefined : routeHint?.poolIds?.[0]
        const order_contract = pool_id
          ? undefined
          : mapProtocolToOrderContract({protocol, routeHint})

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
          pool_id,
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
        splits: splits.map((sp) => toSwapSplit(sp, providersCache)),
      }),
    },
  } as const
}

const toSwapSplit = (
  {
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
  }: Split,
  providersCache: ProviderInfoResponse | null,
): Swap.Split => {
  const dexInfo = providersCache?.dex_info?.[dex]
  const aggregatorImageUrl =
    typeof dexInfo?.image === 'string' ? dexInfo.image : undefined

  return {
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
    ...(aggregatorImageUrl && {aggregatorImageUrl}),
  }
}

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

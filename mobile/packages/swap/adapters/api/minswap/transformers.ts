import {isNonNullable} from '@yoroi/common'
import {Portfolio, Swap} from '@yoroi/types'

import {freeze} from 'immer'

import {
  CancelResponse,
  CreateRequest,
  CreateResponse,
  Dex,
  EstimateRequest,
  EstimateResponse,
  LimitOptionsResponse,
  MinswapApiConfig,
  PathStep,
  PendingOrdersResponse,
  TokensRequest,
  TokensResponse,
} from './types'

export const transformersMaker = (config: MinswapApiConfig) => {
  const {isPrimaryToken, primaryTokenInfo, address, partner} = config

  // Convert portfolio token ID to API token ID
  const toTokenId = (tokenId: Portfolio.Token.Id) => {
    const result = isPrimaryToken(tokenId)
      ? 'lovelace'
      : tokenId.replace('.', '')
    return result
  }

  const fromTokenId = (tokenId: string): Portfolio.Token.Id =>
    tokenId === 'lovelace'
      ? primaryTokenInfo.id
      : `${tokenId.slice(0, 56)}.${tokenId.slice(56)}`

  const transformToken = (
    token: TokensResponse['tokens'][number],
  ): Portfolio.Token.Info => {
    if (isPrimaryToken(token.token_id) || token.token_id === 'lovelace')
      return primaryTokenInfo

    return freeze(
      {
        id: fromTokenId(token.token_id),
        name: token.project_name ?? token.ticker ?? 'Unknown Token',
        decimals: token.decimals ?? 0,
        ticker: token.ticker ?? '',
        status: token.is_verified
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
      },
      true,
    )
  }

  // Transform Minswap paths to Swap.Split format
  const transformPathsToSplits = (paths: Array<PathStep[]>): Swap.Split[] => {
    if (!paths || paths.length === 0) return []

    return paths
      .map((path: PathStep[]) => {
        // Each path is an array of hops - take the first hop for single-hop swaps
        const firstHop = path[0]
        if (!firstHop) return null

        // Parse numeric values with proper error handling
        const amountIn = Number(firstHop.amount_in) || 0
        const amountOut = Number(firstHop.amount_out) || 0
        const minAmountOut = Number(firstHop.min_amount_out) || 0
        const deposits = Number(firstHop.deposits) || 0
        const batcherFee = Number(firstHop.dex_fee) || 0 // dex_fee maps to batcherFee
        const lpFee = Number(firstHop.lp_fee) || 0
        const priceImpact = firstHop.price_impact || 0

        // Calculate prices safely
        const initialPrice = amountIn > 0 ? amountOut / amountIn : 0
        const finalPrice = initialPrice // Barely use the finalPrice and calculating it based on initial and price_impact could be dangerous

        const split = freeze(
          {
            amountIn,
            batcherFee,
            deposits,
            protocol: mapDexToProtocol(firstHop.protocol),
            expectedOutput: minAmountOut,
            expectedOutputWithoutSlippage: amountOut,
            fee: batcherFee, // Keep fee field for backward compatibility
            initialPrice,
            finalPrice,
            poolFee: lpFee,
            poolId: firstHop.pool_id,
            priceDistortion: 0,
            priceImpact,
            aggregator: Swap.Aggregator.Minswap,
            aggregatorDexKey: firstHop.protocol,
            aggregatorPoolId: firstHop.pool_id,
          },
          true,
        )
        return split
      })
      .filter(isNonNullable) as Swap.Split[]
  }

  return freeze(
    {
      tokens: {
        request: (): TokensRequest => ({
          query: '', // Empty string returns all tokens
          only_verified: false, // Return all tokens, not just verified ones
        }),
        response: (data: TokensResponse): Portfolio.Token.Info[] => {
          // Handle both flat structure (actual API) and nested structure (expected by types)
          const transformedTokens = data.tokens.map((token) => {
            // If token has 'asset' property, use it (nested structure)
            // Otherwise, use the token directly (flat structure)
            const tokenData = 'asset' in token ? (token as any).asset : token
            return transformToken(tokenData)
          })

          return transformedTokens.filter(isNonNullable)
        },
      },

      orders: {
        response: (data: PendingOrdersResponse): Swap.Order[] => {
          return data.orders
            .filter(
              (order) => order.token_in?.token_id && order.token_out?.token_id,
            )
            .map((order) =>
              freeze(
                {
                  aggregator: Swap.Aggregator.Minswap,
                  protocol: mapDexToProtocol(order.protocol),
                  placedAt: order.created_at,
                  lastUpdate: order.created_at,
                  status: 'open' as const,
                  tokenIn: fromTokenId(order.token_in.token_id),
                  tokenOut: fromTokenId(order.token_out.token_id),
                  amountIn: Number(order.amount_in),
                  actualAmountOut: Number(order.min_amount_out),
                  expectedAmountOut: Number(order.min_amount_out),
                  txHash: order.tx_in.split('#')[0]!,
                  outputIndex: parseInt(order.tx_in.split('#')[1]!, 10),
                  updateTxHash: undefined, // Minswap only returns pending orders
                  customId: undefined,
                } satisfies Swap.Order,
                true,
              ),
            )
        },
      },

      limitOptions: {
        response: (data: LimitOptionsResponse): Swap.LimitOptionsResponse => {
          return freeze(
            {
              defaultProtocol: Swap.Protocol.Minswap_v2,
              wantedPrice: Number(data.price.toString()),
              options: data.options.map((option) =>
                freeze(
                  {
                    protocol: mapDexToProtocol(option.protocol),
                    initialPrice: option.price,
                    batcherFee: option.fee,
                  },
                  true,
                ),
              ),
            },
            true,
          )
        },
      },

      estimate: {
        request: ({
          amountIn,
          slippage,
          tokenIn,
          tokenOut,
        }: Swap.EstimateRequest): EstimateRequest => {
          const request: EstimateRequest = {
            token_in: toTokenId(tokenIn),
            token_out: toTokenId(tokenOut),
            amount: amountIn?.toString() ?? '0',
            slippage: slippage ?? 0,
            amount_in_decimal: true, // Tell API that amounts are in decimal format
            ...(partner !== undefined && {partner}),
          }
          return request
        },
        response: (data: EstimateResponse): Swap.EstimateResponse => {
          const totalInput = Number(data.amount_in)
          const totalOutput = Number(data.min_amount_out)
          const totalOutputWithoutSlippage = Number(data.amount_out)
          const deposits = Number(data.deposits ?? '0')
          const aggregatorFee = Number(data.aggregator_fee ?? '0')
          const dexFee = Number(data.total_dex_fee ?? '0')
          // Convert to lovelace (integers) to avoid floating point precision issues
          const totalFee =
            (Math.round(aggregatorFee * 1e6) + Math.round(dexFee * 1e6)) / 1e6

          return freeze(
            {
              splits: transformPathsToSplits(data.paths),
              batcherFee: dexFee,
              deposits,
              aggregatorFee,
              frontendFee: 0,
              netPrice: totalInput > 0 ? totalOutput / totalInput : 0,
              priceImpact: data.avg_price_impact,
              totalFee,
              totalOutput,
              totalOutputWithoutSlippage,
              totalInput,
            },
            true,
          )
        },
      },

      create: {
        request: ({
          amountIn,
          slippage,
          tokenIn,
          tokenOut,
          inputs,
        }: Swap.CreateRequest): CreateRequest => {
          const request = {
            sender: address,
            min_amount_out: '0', // Will be calculated by the API
            estimate: {
              amount: amountIn.toString(),
              token_in: toTokenId(tokenIn),
              token_out: toTokenId(tokenOut),
              slippage: slippage || 1,
              ...(partner !== undefined && {partner}),
            },
            amount_in_decimal: true, // Also set at the top level for build-tx
            ...(inputs && inputs.length > 0 && {inputs_to_choose: inputs}),
          }

          return request
        },
        response: (data: CreateResponse): Swap.CreateResponse => {
          return freeze(
            {
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
              aggregator: Swap.Aggregator.Minswap,
              cbor: data.cbor,
            },
            true,
          )
        },
      },

      cancel: {
        response: (data: CancelResponse): Swap.CancelResponse => {
          return freeze(
            {
              cbor: data.cbor,
              additionalCancellationFee: undefined,
            },
            true,
          )
        },
      },
    },
    true,
  )
}

const mapDexToProtocol = (dex: Dex): Swap.Protocol => {
  switch (dex) {
    case Dex.MinswapV2:
      return Swap.Protocol.Minswap_v2
    case Dex.Minswap:
      return Swap.Protocol.Minswap_v1
    case Dex.MinswapStable:
      return Swap.Protocol.Minswap_stable
    case Dex.MuesliSwap:
      return Swap.Protocol.Muesliswap
    case Dex.Splash:
      return Swap.Protocol.Splash_v1
    case Dex.SundaeSwapV3:
      return Swap.Protocol.Sundaeswap_v3
    case Dex.SundaeSwap:
      return Swap.Protocol.Sundaeswap_v1
    case Dex.VyFinance:
      return Swap.Protocol.Vyfi_v1
    case Dex.CswapV1:
      return Swap.Protocol.Cswap
    case Dex.WingRidersV2:
      return Swap.Protocol.Wingriders_v2
    case Dex.WingRiders:
      return Swap.Protocol.Wingriders_v1
    case Dex.WingRidersStableV2:
      return Swap.Protocol.Wingriders_stable
    case Dex.Spectrum:
      return Swap.Protocol.Spectrum_v1
    case Dex.SplashStable:
      return Swap.Protocol.Splash_v1
    default:
      return Swap.Protocol.Unsupported
  }
}

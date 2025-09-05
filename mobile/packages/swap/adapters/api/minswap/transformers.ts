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
  PendingOrdersResponse,
  TokensRequest,
  TokensResponse,
} from './types'

const mapProtocolToDex = (protocol: Swap.Protocol): Dex => {
  switch (protocol) {
    case Swap.Protocol.Minswap_v2:
      return Dex.MinswapV2
    case Swap.Protocol.Minswap_v1:
      return Dex.Minswap
    case Swap.Protocol.Minswap_stable:
      return Dex.MinswapStable
    case Swap.Protocol.Muesliswap:
      return Dex.MuesliSwap
    case Swap.Protocol.Splash_v1:
      return Dex.Splash
    case Swap.Protocol.Sundaeswap_v3:
      return Dex.SundaeSwapV3
    case Swap.Protocol.Sundaeswap_v1:
      return Dex.SundaeSwap
    case Swap.Protocol.Vyfi_v1:
      return Dex.VyFinance
    case Swap.Protocol.Cswap:
      return Dex.CswapV1
    case Swap.Protocol.Wingriders_v2:
      return Dex.WingRidersV2
    case Swap.Protocol.Wingriders_v1:
      return Dex.WingRiders
    case Swap.Protocol.Wingriders_stable:
      return Dex.WingRidersStableV2
    case Swap.Protocol.Spectrum_v1:
      return Dex.Spectrum
    case Swap.Protocol.Splash_v1:
      return Dex.SplashStable
    default:
      return Dex.Unsupported
  }
}

export const transformersMaker = (config: MinswapApiConfig) => {
  const {isPrimaryToken, primaryTokenInfo, address, partner} = config

  // Convert portfolio token ID to API token ID (like DexHunter)
  const toTokenId = (tokenId: Portfolio.Token.Id) => {
    const result = isPrimaryToken(tokenId)
      ? 'lovelace'
      : tokenId.replace('.', '')
    return result
  }

  const transformToken = (token: {
    token_id: string
    logo: string | null
    ticker: string | null
    is_verified: boolean | null
    price_by_ada: number | null
    project_name: string | null
    decimals: number | null
  }): Portfolio.Token.Info => {
    const formattedTokenId: Portfolio.Token.Id =
      token.token_id === 'lovelace'
        ? primaryTokenInfo.id
        : `${token.token_id.slice(0, 56)}.${token.token_id.slice(56)}`

    return freeze(
      {
        id: formattedTokenId,
        name: token.project_name || token.ticker || 'Unknown Token',
        ticker: token.ticker || '',
        decimals: token.decimals || 6,
        logo: token.logo || null,
        description: '',
        website: '',
        policyId:
          token.token_id === 'lovelace' ? '' : token.token_id.slice(0, 56),
        fingerprint: '',
        group: token.token_id === 'lovelace' ? 'ADA' : null,
        kind: token.token_id === 'lovelace' ? 'ft' : 'ft',
        image: token.logo || null,
        icon: token.logo || null,
        symbol: token.ticker || '',
        metadatas: {},
        isPrimaryToken: isPrimaryToken(formattedTokenId),
        status: Portfolio.Token.Status.Valid,
        application: Portfolio.Token.Application.General,
        tag: '',
        reference: '',
        originalImage: '',
        nature: Portfolio.Token.Nature.Secondary,
        type: Portfolio.Token.Type.FT,
      },
      true,
    )
  }

  // Transform Minswap paths to Swap.Split format
  const transformPathsToSplits = (paths: Array<any>): Swap.Split[] => {
    if (!paths || paths.length === 0) return []

    return paths
      .map((path) => {
        // Each path is an array of hops
        const firstHop = path[0]
        if (!firstHop) return null

        const split = freeze(
          {
            amountIn: parseFloat(firstHop.amount_in || '0'),
            batcherFee: 0, // Minswap doesn't provide batcher fee per split
            deposits: parseFloat(firstHop.deposits || '0'),
            protocol: mapDexToProtocol(firstHop.protocol),
            expectedOutput: parseFloat(firstHop.amount_out || '0'),
            expectedOutputWithoutSlippage: parseFloat(
              firstHop.min_amount_out || '0',
            ),
            fee: parseFloat(firstHop.dex_fee || '0'),
            initialPrice:
              parseFloat(firstHop.amount_out || '0') /
              parseFloat(firstHop.amount_in || '1'),
            finalPrice:
              parseFloat(firstHop.amount_out || '0') /
              parseFloat(firstHop.amount_in || '1'),
            poolFee: parseFloat(firstHop.lp_fee || '0'),
            poolId: firstHop.pool_id || '',
            priceDistortion: 0, // Minswap doesn't provide this
            priceImpact: firstHop.price_impact || 0,
          },
          true,
        )
        return split
      })
      .filter(Boolean) as Swap.Split[]
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
                  protocol: Swap.Protocol.Minswap_v2,
                  placedAt: order.created_at,
                  lastUpdate: order.created_at,
                  status: 'open' as const,
                  tokenIn: order.token_in.token_id as `${string}.${string}`,
                  tokenOut: order.token_out.token_id as `${string}.${string}`,
                  amountIn: parseFloat(order.amount_in),
                  actualAmountOut: parseFloat(order.min_amount_out),
                  expectedAmountOut: parseFloat(order.min_amount_out),
                  txHash: order.tx_in.split('#')[0],
                  outputIndex: parseInt(order.tx_in.split('#')[1], 10),
                  updateTxHash: undefined,
                  customId: undefined,
                },
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
              wantedPrice: parseFloat(data.price.toString()),
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
          blockedProtocols,
          slippage,
          tokenIn,
          tokenOut,
        }: Swap.EstimateRequest): EstimateRequest => {
          const request: EstimateRequest = {
            token_in: toTokenId(tokenIn),
            token_out: toTokenId(tokenOut),
            amount: amountIn?.toString() || '0',
            slippage: slippage || 1,
            exclude_protocols: blockedProtocols?.map((p) =>
              mapProtocolToDex(p),
            ),
            amount_in_decimal: true, // Tell API that amounts are in decimal format
            ...(partner !== undefined && {partner}),
          }
          return request
        },
        response: (data: EstimateResponse): Swap.EstimateResponse => {
          const totalInput = parseFloat(data.amount_in)
          const totalOutput = parseFloat(data.amount_out)
          const totalOutputWithoutSlippage = parseFloat(data.min_amount_out)

          return freeze(
            {
              splits: transformPathsToSplits(data.paths),
              batcherFee: parseFloat(data.deposits || '0'),
              deposits: parseFloat(data.deposits || '0'),
              aggregatorFee: parseFloat(data.aggregator_fee || '0'),
              frontendFee: 0,
              netPrice: totalOutput / totalInput,
              priceImpact: data.avg_price_impact,
              totalFee: parseFloat(data.total_dex_fee || '0'),
              totalOutput: totalOutput,
              totalOutputWithoutSlippage: totalOutputWithoutSlippage,
              totalInput: totalInput,
            },
            true,
          )
        },
      },

      create: {
        request: ({
          amountIn,
          blockedProtocols,
          slippage,
          tokenIn,
          tokenOut,
        }: Swap.CreateRequest): CreateRequest => {
          const request = {
            sender: address,
            min_amount_out: '0', // Will be calculated by the API
            estimate: {
              amount: amountIn.toString(),
              token_in: toTokenId(tokenIn),
              token_out: toTokenId(tokenOut),
              slippage: slippage || 1,
              exclude_protocols: blockedProtocols?.map((p) =>
                mapProtocolToDex(p),
              ),
              ...(partner !== undefined && {partner}),
            },
            amount_in_decimal: true, // Also set at the top level for build-tx
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

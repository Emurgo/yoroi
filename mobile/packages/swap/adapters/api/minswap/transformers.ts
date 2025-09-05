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
    default:
      return Dex.Unsupported
  }
}

export const transformersMaker = (config: MinswapApiConfig) => {
  const {isPrimaryToken, primaryTokenInfo, address} = config

  // Convert portfolio token ID to API token ID (like DexHunter)
  const toTokenId = (tokenId: Portfolio.Token.Id) =>
    isPrimaryToken(tokenId) ? 'lovelace' : tokenId.replace('.', '')

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

  return freeze(
    {
      tokens: {
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
        }: Swap.EstimateRequest): EstimateRequest => ({
          token_in: toTokenId(tokenIn),
          token_out: toTokenId(tokenOut),
          amount_in: amountIn?.toString(),
          amount_out: undefined, // Will be calculated by API
          slippage: slippage,
          excluded_sources: blockedProtocols?.map((p) => mapProtocolToDex(p)),
        }),
        response: (data: EstimateResponse): Swap.EstimateResponse => {
          return freeze(
            {
              splits: [],
              batcherFee: parseFloat(data.fee),
              deposits: 0,
              aggregatorFee: 0,
              frontendFee: 0,
              netPrice:
                parseFloat(data.amount_out) / parseFloat(data.amount_in),
              priceImpact: data.price_impact,
              totalFee: parseFloat(data.fee),
              totalOutput: parseFloat(data.amount_out),
              totalOutputWithoutSlippage: parseFloat(data.minimum_received),
              totalInput: parseFloat(data.amount_in),
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
        }: Swap.CreateRequest): CreateRequest => ({
          token_in: toTokenId(tokenIn),
          token_out: toTokenId(tokenOut),
          amount_in: amountIn.toString(),
          amount_out: '0', // Will be calculated by the API
          slippage: slippage || 1,
          user_address: address,
          excluded_sources: blockedProtocols?.map((p) => mapProtocolToDex(p)),
        }),
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

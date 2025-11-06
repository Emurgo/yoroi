import {Portfolio, Swap} from '@yoroi/types'

import {
  BuildSwapRequest,
  BuildSwapResponse,
  CancelRequest,
  CancelResponse,
  Dex,
  EstimateResponse,
  HopSplitOutput,
  OrderStatusResponse,
  SplitOutput,
  SteelswapTransformersConfig,
  SwapEstimateRequest,
  TokensResponse,
} from './types'

export const transformersMaker = ({
  primaryTokenInfo,
  address,
  isPrimaryToken,
  partner = 'yoroi-aggregator',
  getTokenDecimals = () => 6, // Default to 6 decimals if not provided
}: SteelswapTransformersConfig) => {
  const fromTokenId = (tokenId: string): Portfolio.Token.Id => {
    if (tokenId === 'lovelace' || tokenId === 'ADA') {
      return primaryTokenInfo.id
    }
    // Steelswap uses hex-encoded format: policyId + hexName (no separator)
    if (tokenId.length === 120) {
      return `${tokenId.slice(0, 56)}.${tokenId.slice(56)}`
    }
    // If already in format policyId.hexName, return as is
    if (tokenId.includes('.')) {
      return tokenId as Portfolio.Token.Id
    }
    // Fallback
    return tokenId as Portfolio.Token.Id
  }

  const toTokenId = (tokenId: Portfolio.Token.Id): string => {
    if (isPrimaryToken(tokenId)) {
      return 'lovelace'
    }
    return tokenId.replace('.', '')
  }

  // Convert Steelswap token ID (no dot) to Portfolio format (with dot) for cache lookup
  const steelswapToPortfolioId = (tokenId: string): Portfolio.Token.Id => {
    if (tokenId === 'lovelace' || tokenId === 'ADA') {
      return primaryTokenInfo.id
    }
    // Steelswap format: policyId + hexName (no separator, typically 120 chars)
    if (tokenId.length === 120) {
      return `${tokenId.slice(0, 56)}.${tokenId.slice(56)}` as Portfolio.Token.Id
    }
    // If already has dot, return as is
    if (tokenId.includes('.')) {
      return tokenId as Portfolio.Token.Id
    }
    // Fallback: assume it's already in portfolio format
    return tokenId as Portfolio.Token.Id
  }

  const parseAssets = (
    assets: Array<Record<string, number>>,
  ): {token: string; amount: number}[] => {
    const result: {token: string; amount: number}[] = []
    for (const asset of assets) {
      for (const [token, amount] of Object.entries(asset)) {
        // Token from API is in Steelswap format (no dot), convert to Portfolio format
        const portfolioId = steelswapToPortfolioId(token)
        const decimals = getTokenDecimals(portfolioId)
        // Convert from base units to decimal (divide by 10^decimals)
        result.push({
          token,
          amount: amount / 10 ** decimals,
        })
      }
    }
    return result
  }

  return {
    tokens: {
      response: (res: TokensResponse): Array<Portfolio.Token.Info> =>
        res
          .map(({ticker, name, policyId, policyName, decimals}) => {
            const hexName = policyName || ''
            const id = `${policyId}.${hexName}`

            // Filter out primary token (it's already known)
            // Check if policyId is 'lovelace' or if the constructed id matches primaryTokenInfo.id
            const isPrimary =
              policyId === 'lovelace' || id === primaryTokenInfo.id
            if (isPrimary) return null

            if (decimals === null || decimals === undefined) return null

            return {
              status: Portfolio.Token.Status.Valid,
              id,
              ticker: ticker ?? '',
              name: name ?? ticker ?? '',
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

    orders: {
      response: (res: OrderStatusResponse): Array<Swap.Order> => {
        const orders: Swap.Order[] = []

        for (const orderStatus of res.orders) {
          for (const swap of orderStatus.swaps) {
            const submitAssets = swap.submitAssets
              ? parseAssets(swap.submitAssets)
              : []
            const requestAssets = swap.requestAssets
              ? parseAssets(swap.requestAssets)
              : []
            const receivedAssets = swap.receivedAssets
              ? parseAssets(swap.receivedAssets)
              : []

            // Find tokenIn and tokenOut from assets
            const tokenInAsset = submitAssets[0]
            const tokenOutAsset = requestAssets[0]
            const receivedAsset = receivedAssets[0]

            if (!tokenInAsset || !tokenOutAsset) continue

            const tokenIn = fromTokenId(tokenInAsset.token)
            const tokenOut = fromTokenId(tokenOutAsset.token)
            const amountIn = tokenInAsset.amount
            const expectedAmountOut = tokenOutAsset.amount
            const actualAmountOut = receivedAsset?.amount ?? expectedAmountOut

            // Map txStatus to our status
            const statusMap: Record<string, Swap.Order['status']> = {
              txPending: 'open',
              queued: 'open',
              executed: 'matched',
              cancelled: 'canceled',
            }
            const status = statusMap[swap.txStatus] ?? 'open'

            orders.push({
              status,
              txHash: swap.submitTxHash,
              outputIndex: swap.submitTxIndex,
              tokenIn,
              tokenOut,
              updateTxHash: swap.executeTxHash ?? swap.submitTxHash,
              placedAt: swap.submitTime ? swap.submitTime * 1000 : undefined,
              lastUpdate: swap.executeTime
                ? swap.executeTime * 1000
                : swap.submitTime
                  ? swap.submitTime * 1000
                  : undefined,
              amountIn,
              actualAmountOut,
              expectedAmountOut,
              aggregator: Swap.Aggregator.Steelswap,
              protocol: toSwapProtocol(swap.dex),
              customId: `${swap.submitTxHash}#${swap.submitTxIndex}`,
            })
          }
        }

        return orders
      },
    },

    estimate: {
      request: ({
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        slippage: _slippage,
        protocol: _protocol,
        blockedProtocols,
      }: Swap.EstimateRequest): SwapEstimateRequest => {
        const tokenAId = toTokenId(tokenIn)
        const tokenBId = toTokenId(tokenOut)
        const tokenADecimals = getTokenDecimals(tokenIn)
        const tokenBDecimals = getTokenDecimals(tokenOut)

        // Convert from decimal to base units (multiply by 10^decimals)
        const quantity = amountIn
          ? amountIn * 10 ** tokenADecimals
          : amountOut
            ? amountOut * 10 ** tokenBDecimals
            : 0

        return {
          tokenA: tokenAId,
          tokenB: tokenBId,
          quantity: Math.round(quantity),
          predictFromOutputAmount: amountOut !== undefined,
          ...(blockedProtocols !== undefined &&
            blockedProtocols.length > 0 && {
              ignoreDexes: blockedProtocols.map(fromSwapProtocol),
            }),
          partner,
        }
      },
      response: (data: EstimateResponse): Swap.EstimateResponse => {
        // Handle both SplitOutput and HopSplitOutput
        const isHopSplit = 'splitGroup' in data
        const splitOutput = isHopSplit
          ? (data as HopSplitOutput).splitGroup?.[0]?.[0]
          : (data as SplitOutput)

        if (
          !splitOutput ||
          !splitOutput.pools ||
          splitOutput.pools.length === 0
        ) {
          throw new Error(
            'Invalid estimate response: missing split output or pools',
          )
        }

        // Token IDs from API are in Steelswap format (no dot), convert to Portfolio format
        const tokenADecimals = getTokenDecimals(
          steelswapToPortfolioId(splitOutput.tokenA),
        )
        const tokenBDecimals = getTokenDecimals(
          steelswapToPortfolioId(splitOutput.tokenB),
        )
        const lovelaceDecimals = getTokenDecimals(primaryTokenInfo.id) // Fees are always in lovelace

        // Convert from base units to decimal (divide by 10^decimals)
        const splits = splitOutput.pools.map((pool) => ({
          amountIn: pool.quantityA / 10 ** tokenADecimals,
          batcherFee: pool.batcherFee / 10 ** lovelaceDecimals, // Fees in lovelace
          deposits: pool.deposit / 10 ** lovelaceDecimals, // Fees in lovelace
          protocol: toSwapProtocol(pool.dex as Dex),
          expectedOutput: pool.quantityB / 10 ** tokenBDecimals,
          expectedOutputWithoutSlippage: pool.quantityB / 10 ** tokenBDecimals,
          fee: pool.volumeFee / 10 ** lovelaceDecimals, // Fees in lovelace
          initialPrice:
            pool.quantityA > 0 ? pool.quantityB / pool.quantityA : 0,
          finalPrice: pool.quantityA > 0 ? pool.quantityB / pool.quantityA : 0,
          poolFee: pool.volumeFee / 10 ** lovelaceDecimals, // Fees in lovelace
          poolId: pool.poolId,
          priceDistortion: 0,
          priceImpact: 0,
          aggregator: Swap.Aggregator.Steelswap,
          aggregatorDexKey: pool.dex,
          aggregatorPoolId: pool.poolId,
        }))

        const totalInput = splitOutput.quantityA / 10 ** tokenADecimals
        const totalOutput = splitOutput.quantityB / 10 ** tokenBDecimals
        const batcherFee = splitOutput.totalFee / 10 ** lovelaceDecimals // Sum of batcher fees
        const deposits = splitOutput.totalDeposit / 10 ** lovelaceDecimals // Sum of deposits
        const aggregatorFee = splitOutput.steelswapFee / 10 ** lovelaceDecimals // Aggregator fee
        // Sum of all pool volume fees (pool fees)
        const totalVolumeFee =
          splitOutput.pools.reduce((sum, pool) => sum + pool.volumeFee, 0) /
          10 ** lovelaceDecimals
        // Total fee = batcher fees + volume fees + aggregator fees
        const totalFee = batcherFee + totalVolumeFee + aggregatorFee

        // Price from API is inverted (input/output instead of output/input)
        // Calculate correct price: output per input (same as Minswap)
        const netPrice = totalInput > 0 ? totalOutput / totalInput : 0

        return {
          splits,
          batcherFee,
          deposits,
          aggregatorFee,
          frontendFee: 0,
          netPrice,
          priceImpact: 0,
          totalFee,
          totalInput,
          totalOutput,
          totalOutputWithoutSlippage:
            totalOutput + splitOutput.bonusOut / 10 ** tokenBDecimals,
        }
      },
    },

    create: {
      request: ({
        tokenIn,
        tokenOut,
        amountIn,
        slippage,
        protocol: _protocol,
        blockedProtocols,
        inputs,
      }: Swap.CreateRequest): BuildSwapRequest => {
        const tokenAId = toTokenId(tokenIn)
        const tokenADecimals = getTokenDecimals(tokenIn)

        // Convert from decimal to base units (multiply by 10^decimals)
        const quantity = amountIn * 10 ** tokenADecimals

        return {
          tokenA: tokenAId,
          tokenB: toTokenId(tokenOut),
          quantity: Math.round(quantity),
          ...(blockedProtocols !== undefined &&
            blockedProtocols.length > 0 && {
              ignoreDexes: blockedProtocols.map(fromSwapProtocol),
            }),
          partner,
          address,
          utxos: inputs ?? [],
          slippage: slippage ? Math.round(slippage * 100) : 0, // Convert percentage to basis points
        }
      },
      response: ({tx, p: _p}: BuildSwapResponse): Swap.CreateResponse => {
        return {
          aggregator: Swap.Aggregator.Steelswap,
          cbor: tx,
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
        }
      },
    },

    cancel: {
      request: ({order}: Swap.CancelRequest): CancelRequest => ({
        txList: [
          {
            txHash: order.txHash,
            txIndex: order.outputIndex ?? 0,
          },
        ],
        ttl: 900,
        partner,
      }),
      response: (txHex: CancelResponse): Swap.CancelResponse => ({
        cbor: txHex,
      }),
    },
  } as const
}

export const toSwapProtocol = (dex: string): Swap.Protocol => {
  const dexUpper = dex.toUpperCase()
  const dexMap: Record<string, Swap.Protocol> = {
    CSWAP: Swap.Protocol.Cswap,
    GENIUSYIELD: Swap.Protocol.Genius,
    MINSWAP: Swap.Protocol.Minswap_v1,
    MINSWAPV2: Swap.Protocol.Minswap_v2,
    MINSWAPV2ROUTER: Swap.Protocol.Minswap_v2,
    MUESLISWAP: Swap.Protocol.Muesliswap_v2,
    SPECTRUM: Swap.Protocol.Spectrum_v1,
    SPLASH: Swap.Protocol.Splash_v1,
    SPLASHROUTER: Swap.Protocol.Splash_v1,
    SUNDAESWAP: Swap.Protocol.Sundaeswap_v1,
    SUNDAESWAPV3: Swap.Protocol.Sundaeswap_v3,
    VYFI: Swap.Protocol.Vyfi_v1,
    WINGRIDERS: Swap.Protocol.Wingriders_v1,
    WINGRIDERSV2: Swap.Protocol.Wingriders_v2,
  }

  return dexMap[dexUpper] ?? Swap.Protocol.Unsupported
}

export const fromSwapProtocol = (dex: Swap.Protocol): Dex => {
  const protocolMap: Record<Swap.Protocol, Dex> = {
    [Swap.Protocol.Cswap]: Dex.CSWAP,
    [Swap.Protocol.Genius]: Dex.GeniusYield,
    [Swap.Protocol.Minswap_v1]: Dex.Minswap,
    [Swap.Protocol.Minswap_v2]: Dex.MinswapV2,
    [Swap.Protocol.Minswap_stable]: Dex.MinswapV2,
    [Swap.Protocol.Muesliswap]: Dex.MuesliSwap,
    [Swap.Protocol.Muesliswap_v1]: Dex.MuesliSwap,
    [Swap.Protocol.Muesliswap_v2]: Dex.MuesliSwap,
    [Swap.Protocol.Muesliswap_clp]: Dex.MuesliSwap,
    [Swap.Protocol.Muesliswap_orderbook]: Dex.MuesliSwap,
    [Swap.Protocol.Spectrum_v1]: Dex.Spectrum,
    [Swap.Protocol.Splash_v1]: Dex.Splash,
    [Swap.Protocol.Splash_v4]: Dex.Splash,
    [Swap.Protocol.Splash_v5]: Dex.Splash,
    [Swap.Protocol.Splash_v6]: Dex.Splash,
    [Swap.Protocol.Sundaeswap_v1]: Dex.SundaeSwap,
    [Swap.Protocol.Sundaeswap_v3]: Dex.SundaeSwapV3,
    [Swap.Protocol.Vyfi_v1]: Dex.VyFi,
    [Swap.Protocol.Wingriders_v1]: Dex.WingRiders,
    [Swap.Protocol.Wingriders_v2]: Dex.WingRidersV2,
    [Swap.Protocol.Wingriders_stable]: Dex.WingRidersV2,
    [Swap.Protocol.Teddy_v1]: Dex.Unsupported,
    [Swap.Protocol.Snekfun]: Dex.Unsupported,
    [Swap.Protocol.Chadswap]: Dex.Unsupported,
    [Swap.Protocol.Cerra]: Dex.Unsupported,
    [Swap.Protocol.Unsupported]: Dex.Unsupported,
  }

  return protocolMap[dex] ?? Dex.Unsupported
}

export const SteelswapProtocols = Object.values(Dex)
  .filter((p) => p !== Dex.Unsupported)
  .map(toSwapProtocol)

import AssetFingerprint from '@emurgo/cip14-js'
import {Swap, Balance, Portfolio} from '@yoroi/types'
import {isString} from '@yoroi/common'
import {AssetNameUtils} from '@emurgo/yoroi-lib/dist/internals/utils/assets'

import {Quantities} from '../utils/quantities'
import {supportedProviders} from '../translators/constants'
import {asQuantity} from '../utils/asQuantity'
import {
  CompletedOrder,
  LiquidityPool,
  ListTokensResponse,
  OpenOrder,
  TokenPair,
  TokenPairsResponse,
} from '../adapters/openswap-api/types'

export const transformersMaker = (primaryTokenInfo: Portfolio.Token.Info) => {
  const asOpenswapTokenId = (yoroiTokenId: string) => {
    const [policyId, assetName = ''] = yoroiTokenId.split('.') as [
      string,
      string?,
    ]
    // we dont convert to '.' or 'lovelace' only ''
    return {
      policyId,
      assetName,
    }
  }

  const asOpenswapPriceTokenAddress = (yoroiTokenId: string) => {
    const [policyId, name = ''] = yoroiTokenId.split('.') as [string, string?]
    // we dont convert to '.' or 'lovelace' only ''
    return {
      policyId,
      name,
    }
  }

  const asYoroiTokenId = ({
    policyId,
    name,
  }: {
    policyId: string
    name: string
  }): Portfolio.Token.Id => {
    const possibleTokenId = `${policyId}.${name}`
    // openswap is inconsistent about ADA
    // sometimes is '.', '' or 'lovelace'
    const isPrimaryToken =
      possibleTokenId === '.' || possibleTokenId === 'lovelace.'
    if (policyId === '' || isPrimaryToken) return primaryTokenInfo.id
    return `${policyId}.${name}`
  }

  const asOpenswapAmount = (yoroiAmount: {
    tokenId: Portfolio.Token.Id
    quantity: bigint
  }) => {
    const {tokenId, quantity: amount} = yoroiAmount
    const {policyId, assetName} = asOpenswapTokenId(tokenId)
    return {
      amount: amount.toString(),
      assetName,
      policyId,
    } as const
  }

  const asYoroiOpenOrder = (openswapOrder: OpenOrder) => {
    const {from, to, deposit, ...rest} = openswapOrder
    const [policyId, name = ''] = primaryTokenInfo.id.split('.') as [
      string,
      string?,
    ]
    return {
      ...rest,
      from: asYoroiTokenIdAndQuantity(from),
      to: asYoroiTokenIdAndQuantity(to),
      deposit: asYoroiTokenIdAndQuantity({
        amount: deposit,
        address: {
          policyId,
          name,
        },
      }),
    } as const
  }

  const asYoroiCompletedOrder = (openswapOrder: CompletedOrder) => {
    const {txHash, fromAmount, fromToken, toAmount, toToken, placedAt, dex} =
      openswapOrder
    const from = {
      amount: fromAmount,
      token: `${fromToken.address.policyId}.${fromToken.address.name}`,
    }
    const to = {
      amount: toAmount,
      token: `${toToken.address.policyId}.${toToken.address.name}`,
    }

    return {
      txHash,
      from: asYoroiTokenIdAndQuantity(from),
      to: asYoroiTokenIdAndQuantity(to),
      placedAt: placedAt * 1000,
      provider: dex ?? 'muesliswap',
    } as const
  }

  const asYoroiPortfolioTokenInfo = (
    openswapToken: TokenPair['info'],
  ): Portfolio.Token.Info => {
    const id = asYoroiTokenId(openswapToken.address)

    const isPrimary = id === primaryTokenInfo.id
    if (isPrimary) return primaryTokenInfo

    const tokenInfo: Portfolio.Token.Info = {
      id,
      fingerprint: asTokenFingerprint({
        policyId: openswapToken.address.policyId,
        assetNameHex: openswapToken.address.name,
      }),
      name: asTokenName(openswapToken.address.name),
      decimals: openswapToken.decimalPlaces,
      description: openswapToken.description,
      originalImage: openswapToken.image ?? '',
      type: Portfolio.Token.Type.FT,
      nature: Portfolio.Token.Nature.Secondary,
      ticker: openswapToken.symbol,
      symbol: openswapToken.sign ?? '',
      status: Portfolio.Token.Status.Valid,
      application: Portfolio.Token.Application.General,
      reference: '',
      tag: '',
      website: openswapToken.website,
    }
    return tokenInfo
  }

  const asYoroiPortfolioTokenInfos = (
    openswapTokens: ListTokensResponse,
  ): Array<Portfolio.Token.Info> => {
    if (openswapTokens.length === 0) return []
    // filters should go into manager, but since we strip out the status is here for now
    return openswapTokens
      .filter((token) => token.status === 'verified')
      .map(asYoroiPortfolioTokenInfo)
  }

  const asYoroiPortfolioTokenInfosFromPairs = (
    openswapTokens: TokenPairsResponse,
  ): Array<Portfolio.Token.Info> => {
    if (openswapTokens.length === 0) return []
    // filters should go into manager, but since we strip out the status is here for now
    return openswapTokens
      .filter((token) => token.info.status === 'verified')
      .map((token) => token.info)
      .map(asYoroiPortfolioTokenInfo)
  }

  const asYoroiPool = (
    openswapLiquidityPool: LiquidityPool,
  ): Swap.Pool | null => {
    const {
      batcherFee,
      poolFee,
      lvlDeposit,
      lpToken,
      tokenA,
      tokenB,
      provider,
      poolId,
    } = openswapLiquidityPool

    if (provider && !isSupportedProvider(provider)) return null

    const pool: Swap.Pool = {
      tokenA: asYoroiTokenIdAndQuantity(tokenA),
      tokenB: asYoroiTokenIdAndQuantity(tokenB),
      ptPriceTokenA: tokenA.priceAda.toString(),
      ptPriceTokenB: tokenB.priceAda.toString(),
      deposit: asYoroiTokenIdAndQuantity({amount: lvlDeposit}),
      lpToken: asYoroiTokenIdAndQuantity(lpToken),
      batcherFee: asYoroiTokenIdAndQuantity({amount: batcherFee}),
      fee: poolFee,
      poolId,
      provider,
    }
    return pool
  }

  const asYoroiAmount = (openswapAmount: {
    address?: {
      policyId: string
      name: string
    }
    // openswap is inconsistent about ADA
    // sometimes is '.', '' or 'lovelace'
    token?: string
    amount?: string
  }): Balance.Amount => {
    const {amount, address, token} = openswapAmount ?? {}

    let policyId = ''
    let name = ''

    if (address) {
      policyId = address.policyId
      name = address.name
    } else if (isString(token)) {
      const tokenParts = token.split('.') as [string, string?]
      policyId = tokenParts[0]
      name = tokenParts[1] ?? ''
    }

    const yoroiAmount: Balance.Amount = {
      quantity: asQuantity(amount ?? Quantities.zero),
      tokenId: asYoroiTokenId({policyId, name}),
    } as const

    return yoroiAmount
  }

  const asYoroiTokenIdAndQuantity = (openswapAmount: {
    address?: {
      policyId: string
      name: string
    }
    // openswap is inconsistent about ADA
    // sometimes is '.', '' or 'lovelace'
    token?: string
    amount?: string
  }): {
    tokenId: Portfolio.Token.Id
    quantity: bigint
  } => {
    const {amount, address, token} = openswapAmount

    let policyId = ''
    let name = ''

    if (address) {
      policyId = address.policyId
      name = address.name
    } else if (isString(token)) {
      const tokenParts = token.split('.') as [string, string?]
      policyId = tokenParts[0]
      name = tokenParts[1] ?? ''
    }

    const yoroiAmount = {
      quantity: BigInt(amount ?? 0),
      tokenId: asYoroiTokenId({policyId, name}),
    } as const

    return yoroiAmount
  }

  /**
   *  Filter out pools that are not supported by Yoroi
   *
   * @param openswapLiquidityPools
   * @returns {Swap.Pool[]}
   */
  const asYoroiPools = (
    openswapLiquidityPools: LiquidityPool[],
  ): Swap.Pool[] => {
    if (openswapLiquidityPools?.length > 0)
      return openswapLiquidityPools
        .map(asYoroiPool)
        .filter((pool): pool is Swap.Pool => pool !== null)

    return []
  }

  return {
    asOpenswapTokenId,
    asOpenswapPriceTokenAddress,
    asOpenswapAmount,

    asYoroiCompletedOrder,
    asYoroiOpenOrder,

    asYoroiPool,
    asYoroiPools,

    asYoroiTokenId,
    asYoroiAmount,
    asYoroiTokenIdAndQuantity,

    asYoroiPortfolioTokenInfo,
    asYoroiPortfolioTokenInfos,
    asYoroiPortfolioTokenInfosFromPairs,
  }
}

export const asTokenFingerprint = ({
  policyId,
  assetNameHex = '',
}: {
  policyId: string
  assetNameHex: string | undefined
}) => {
  const assetFingerprint = AssetFingerprint.fromParts(
    Buffer.from(policyId, 'hex'),
    Buffer.from(assetNameHex, 'hex'),
  )
  return assetFingerprint.fingerprint()
}

export const asTokenName = (hex: string) => {
  const {asciiName, hexName} = AssetNameUtils.resolveProperties(hex)
  return asciiName ?? hexName
}

function isSupportedProvider(
  provider: string,
): provider is Swap.SupportedProvider {
  return supportedProviders.includes(provider as Swap.SupportedProvider)
}

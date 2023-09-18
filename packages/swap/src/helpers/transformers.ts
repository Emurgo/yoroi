import AssetFingerprint from '@emurgo/cip14-js'
import {Swap, Portfolio} from '@yoroi/types'
import {OpenSwap} from '@yoroi/openswap'

export const transformersMaker = (
  primaryTokenId: Portfolio.Token['info']['id'],
) => {
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

  const asYoroiTokenId = ({
    policyId,
    name,
  }: {
    policyId: string
    name: string
  }): Portfolio.Token['info']['id'] => {
    const possibleTokenId = `${policyId}.${name}`
    // openswap is inconsistent about ADA
    // sometimes is '.', '' or 'lovelace'
    const isPrimaryToken =
      possibleTokenId === '.' || possibleTokenId === 'lovelace.'
    if (policyId === '' || isPrimaryToken) return primaryTokenId
    return `${policyId}.${name}`
  }

  const asOpenswapAmount = (yoroiAmount: Portfolio.Amount) => {
    const {tokenId, quantity: amount} = yoroiAmount
    const {policyId, assetName} = asOpenswapTokenId(tokenId)
    return {
      amount,
      assetName,
      policyId,
    } as const
  }

  const asYoroiOpenOrder = (openswapOrder: OpenSwap.OpenOrder) => {
    const {from, to, deposit, ...rest} = openswapOrder
    return {
      ...rest,
      from: asYoroiAmount(from),
      to: asYoroiAmount(to),
      deposit: asYoroiAmount({amount: deposit, token: primaryTokenId}),
    } as const
  }

  const asYoroiCompletedOrder = (openswapOrder: OpenSwap.CompletedOrder) => {
    const {txHash, fromAmount, fromToken, toAmount, toToken} = openswapOrder
    const from = {
      amount: fromAmount,
      token: `${fromToken.address.policyId}.${fromToken.address.name}`,
    }
    const to = {
      amount: toAmount,
      token: `${toToken.address.policyId}.${toToken.address.name}`,
    }

    return {
      txHash: txHash,
      from: asYoroiAmount(from),
      to: asYoroiAmount(to),
    } as const
  }

  const asYoroiBalanceToken = (
    openswapToken: OpenSwap.Token,
  ): Portfolio.Token => {
    const {info, price} = openswapToken
    const balanceToken: Portfolio.Token = {
      info: {
        id: asYoroiTokenId(info.address),
        group: info.address.policyId,
        fingerprint: asTokenFingerprint({
          policyId: info.address.policyId,
          assetNameHex: info.address.name,
        }),
        name: asUtf8(info.address.name),
        decimals: info.decimalPlaces,
        description: info.description,
        image: info.image,
        kind: 'ft',
        symbol: info?.sign,
        icon: undefined,
        ticker: info.symbol,
      },
      price: {
        ...price,
      },
      status: info.status,
    }

    const supply: Portfolio.TokenSupply = {
      circulating: info.supply.circulating
        ? (info.supply.circulating as Portfolio.Quantity)
        : undefined,
      total: info.supply.total as Portfolio.Quantity,
    }
    balanceToken.supply = supply

    return balanceToken
  }

  const asYoroiPool = (openswapPool: OpenSwap.Pool): Swap.Pool => {
    const {
      batcherFee,
      fee,
      deposit,
      lpToken,
      tokenA,
      tokenB,
      timestamp,
      provider,
      price,
      poolId,
    } = openswapPool
    const pool: Swap.Pool = {
      tokenA: asYoroiAmount(tokenA),
      tokenB: asYoroiAmount(tokenB),
      deposit: asYoroiAmount({amount: deposit.toString(), token: ''}),
      lpToken: asYoroiAmount(lpToken),
      batcherFee: asYoroiAmount(batcherFee),
      lastUpdate: timestamp,
      fee,
      price,
      poolId,
      provider,
    }
    return pool
  }

  const asYoroiAmount = (openswapAmount: {
    amount: string
    token: string
  }): Portfolio.Amount => {
    if (openswapAmount !== null && openswapAmount?.amount !== null) {
      // openswap is inconsistent about ADA
      // sometimes is '.', '' or 'lovelace'
      const {amount, token} = openswapAmount
      const [policyId, name = ''] = token.split('.') as [string, string?]
      return {
        quantity: amount as Portfolio.Quantity,
        tokenId: asYoroiTokenId({policyId, name}),
      } as const
    }
    return {quantity: '0', tokenId: ''} as const
  }

  const asYoroiPools = (openswapPools: OpenSwap.Pool[]): Swap.Pool[] => {
    return openswapPools?.length > 0 ? openswapPools.map(asYoroiPool) : []
  }

  const asYoroiBalanceTokens = (
    openswapTokens: OpenSwap.Token[],
  ): Portfolio.Token[] => openswapTokens.map(asYoroiBalanceToken)

  return {
    asOpenswapTokenId,
    asOpenswapAmount,

    asYoroiTokenId,
    asYoroiAmount,
    asYoroiBalanceToken,
    asYoroiBalanceTokens,
    asYoroiCompletedOrder,
    asYoroiOpenOrder,
    asYoroiPool,
    asYoroiPools,
  }
}

// TODO: later replace for @yoroi/wallets
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

export const asUtf8 = (hex: string) => Buffer.from(hex, 'hex').toString('utf-8')

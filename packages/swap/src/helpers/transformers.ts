import AssetFingerprint from '@emurgo/cip14-js'
import {Swap, Balance} from '@yoroi/types'
import {OpenSwap} from '@yoroi/openswap'

export const asOpenswapTokenId = (yoroiTokenId: string) => {
  const [policyId, assetName = ''] = yoroiTokenId.split('.') as [
    string,
    string?,
  ]
  return {
    policyId,
    assetName,
  }
}

export const asYoroiTokenId = ({
  policyId,
  name,
}: {
  policyId: string
  name: string
}): Balance.Token['info']['id'] => {
  if (policyId === '') return ''
  return `${policyId}.${name}`
}

export const asOpenswapAmount = (yoroiAmount: Balance.Amount) => {
  const {tokenId, quantity: amount} = yoroiAmount
  const {policyId, assetName} = asOpenswapTokenId(tokenId)
  return {
    amount,
    assetName,
    policyId,
  } as const
}

export const asYoroiOpenOrder = (
  openswapOrder: OpenSwap.OpenOrder,
  primaryTokenId: string,
) => {
  const {from, to, deposit, ...rest} = openswapOrder
  return {
    ...rest,
    from: asYoroiAmount(from),
    to: asYoroiAmount(to),
    deposit: asYoroiAmount({amount: deposit, token: primaryTokenId}),
  } as const
}

export const asYoroiCompletedOrder = (
  openswapOrder: OpenSwap.CompletedOrder,
) => {
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

export const asYoroiBalanceToken = (
  openswapToken: OpenSwap.Token,
): Balance.Token => {
  const {info, price} = openswapToken
  const balanceToken: Balance.Token = {
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
      symbol: info.symbol,
      icon: undefined,
      ticker: undefined,
      metadatas: {},
    },
    price: {
      ...price,
    },
    status: info.status,
    supply: {
      ...info.supply,
    },
  }
  return balanceToken
}

export const asYoroiPool = (openswapPool: OpenSwap.Pool): Swap.Pool => {
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

export const asYoroiAmount = (openswapAmount: {
  amount: string
  token: string
}): Balance.Amount => {
  if (openswapAmount !== null && openswapAmount?.amount !== null) {
    const {amount, token} = openswapAmount
    const [policyId, assetName = ''] = token.split('.') as [string, string?]
    const subject = `${policyId}.${assetName}`
    return {
      quantity: amount as Balance.Quantity,
      tokenId: subject.length === 1 ? '' : subject,
    } as const
  }
  return {quantity: '0', tokenId: ''}
}

export const asYoroiPools = (openswapPools: OpenSwap.Pool[]): Swap.Pool[] => {
  return openswapPools?.length > 0 ? openswapPools.map(asYoroiPool) : []
}

export const asYoroiBalanceTokens = (
  openswapTokens: OpenSwap.Token[],
): Balance.Token[] => openswapTokens.map(asYoroiBalanceToken)

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

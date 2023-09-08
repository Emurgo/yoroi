import AssetFingerprint from '@emurgo/cip14-js'
import {Swap, Balance} from '@yoroi/types'
import {Order, Pool, Token} from '@yoroi/openswap'

export const asOpenswapTokenId = (yoroiTokenId: string) => {
  const [policyId = '', assetName = ''] = yoroiTokenId.split('.')
  return {
    policyId,
    assetName,
  }
}

export const asOpenswapTokenIdHex = (yoroiTokenId: string) => {
  const [policyId = '', assetName = ''] = yoroiTokenId.split('.')
  return {
    policyId,
    assetNameHex: assetName,
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

export const asYoroiOrder = (openswapOrder: Order, primaryTokenId: string) => {
  const {from, to, deposit, ...rest} = openswapOrder
  return {
    ...rest,
    from: asYoroiAmount(from),
    to: asYoroiAmount(to),
    deposit: asYoroiAmount({amount: deposit, token: primaryTokenId}),
  } as const
}

export const asYoroiBalanceToken = (openswapToken: Token): Balance.Token => {
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

export const asYoroiPool = (openswapPool: Pool): Swap.PoolPair => {
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
  const pool: Swap.PoolPair = {
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
  const {amount, token} = openswapAmount
  if (amount) {
    const [policyId = '', assetName = ''] = token.split('.')
    const subject = `${policyId}.${assetName}`
    return {
      quantity: amount as Balance.Quantity,
      tokenId: subject.length === 1 ? '' : subject,
    } as const
  }
  return {quantity: '0', tokenId: ''}
}

export const asYoroiPools = (openswapPools: Pool[]): Swap.PoolPair[] => {
  return openswapPools.map(asYoroiPool)
}

export const asYoroiBalanceTokens = (
  openswapTokens: Token[],
): Balance.Token[] => openswapTokens.map(asYoroiBalanceToken)

export const asYoroiOrders = (
  openswapOrders: Order[],
  primaryTokenId: string,
): Swap.Order[] =>
  openswapOrders.map((order) => asYoroiOrder(order, primaryTokenId))

// TODO: later replace for @yoroi/utils
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

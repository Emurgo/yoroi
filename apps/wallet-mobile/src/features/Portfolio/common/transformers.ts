import {parseTokenId} from '@yoroi/portfolio'
import {Chain, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {NetworkId, RawUtxo, RemoteAsset} from '../../../yoroi-wallets/types'

export function toChainSupportedNetwork(networkId: NetworkId): Chain.SupportedNetworks {
  switch (networkId) {
    case 0:
    case 1:
      return Chain.Network.Main
    case 450:
      return Chain.Network.Sancho
    default:
      return Chain.Network.Preprod
  }
}

export function toBalanceManagerArgs(rawUtxos: RawUtxo[]) {
  let ptBalance = 0n
  const secondary = new Map<Portfolio.Token.Id, Omit<Portfolio.Token.Balance, 'info'>>()
  for (const utxo of rawUtxos) {
    ptBalance += BigInt(utxo.amount)
    for (const record of utxo.assets) {
      const tokenId = toTokenId(record.assetId)
      if (!tokenId) continue // skip invalid token ids
      secondary.set(tokenId, {
        balance: secondary.get(tokenId)?.balance ?? 0n + BigInt(record.amount),
      })
    }
  }

  return freeze(
    {
      primaryBalance: {
        balance: ptBalance,
        minRequiredByTokens: 0n,
        lockedInBuiltTxs: 0n,
        records: [],
      },
      secondaryBalances: new Map(secondary),
    },
    true,
  )
}

const toTokenId = (assetId: RemoteAsset['assetId']) => {
  return parseTokenId(`${assetId.slice(0, 56)}.${assetId.slice(56)}`)
}

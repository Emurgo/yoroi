import {Portfolio} from '@yoroi/types'

import {RawUtxo} from '../../../../yoroi-wallets/types'

export function toBalanceManagerSyncArgs(rawUtxos: RawUtxo[], lockedAsStorageCost: bigint) {
  let primaryTokenBalance = 0n
  const secondaries = new Map<Portfolio.Token.Id, Omit<Portfolio.Token.Balance, 'info'>>()
  for (const utxo of rawUtxos) {
    primaryTokenBalance += BigInt(utxo.amount)
    for (const record of utxo.assets) {
      const tokenId: Portfolio.Token.Id = `${record.policyId}.${record.name}`
      const balance = (secondaries.get(tokenId)?.balance ?? 0n) + BigInt(record.amount)
      secondaries.set(tokenId, {
        balance,
      })
    }
  }

  return {
    primaryStated: {
      totalFromTxs: primaryTokenBalance,
      lockedAsStorageCost,
    },
    secondaryBalances: new Map(secondaries),
  }
}

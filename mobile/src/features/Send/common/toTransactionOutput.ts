import {asQuantity} from '@yoroi/cardano-wallet'
import {TransactionOutput} from '@yoroi/tx'
import {DatumCbor, DatumHash, Transfer} from '@yoroi/types'

export function toTransactionOutput(entry: Transfer.Entry): TransactionOutput {
  return {
    address: entry.address,
    datum: entry.datum
      ? entry.datum.type === 'hash'
        ? {hash: entry.datum.hash as DatumHash}
        : entry.datum.type === 'inline' || entry.datum.type === 'embedded'
          ? {data: entry.datum.data as DatumCbor}
          : undefined
      : undefined,
    amounts: Object.fromEntries(
      Object.entries(entry.amounts).map(([tokenId, amount]) => [
        tokenId,
        asQuantity(amount.quantity.toString()),
      ]),
    ),
  }
}

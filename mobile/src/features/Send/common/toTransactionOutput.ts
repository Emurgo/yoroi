import {TransactionOutput} from '@yoroi/tx'
import {Transfer} from '@yoroi/types'

import {asQuantity} from '~/wallets/utils/utils'

export function toTransactionOutput(entry: Transfer.Entry): TransactionOutput {
  return {
    address: entry.address,
    datum: entry.datum,
    amounts: Object.fromEntries(
      Object.entries(entry.amounts).map(([tokenId, amount]) => [
        tokenId,
        asQuantity(amount.quantity.toString()),
      ]),
    ),
  }
}

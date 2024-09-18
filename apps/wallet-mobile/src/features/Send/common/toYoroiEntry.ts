import {Transfer} from '@yoroi/types'

import {YoroiEntry} from '../../../yoroi-wallets/types/yoroi'
import {asQuantity} from '../../../yoroi-wallets/utils/utils'

export function toYoroiEntry(entry: Transfer.Entry): YoroiEntry {
  const yoroiEntry: YoroiEntry = {
    address: entry.address,
    datum: entry.datum,
    amounts: Object.fromEntries(
      Object.entries(entry.amounts).map(([tokenId, amount]) => [tokenId, asQuantity(amount.quantity.toString())]),
    ),
  }

  return yoroiEntry
}

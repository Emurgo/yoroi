import {Transfer} from '@yoroi/types'

import {YoroiEntry} from '../../../yoroi-wallets/types'
import {asQuantity} from '../../../yoroi-wallets/utils'

export function toYoroiEntry(entry: Transfer.Entry): YoroiEntry {
  const yoroiEntry: YoroiEntry = {
    address: entry.address,
    datum: entry.datum,
    amounts: Object.fromEntries(
      Object.entries(entry.amounts).map(([tokenId, amount]) => [
        // createPrimary helper forces '.' and this transformer is temporary
        tokenId === '.' ? '' : tokenId,
        asQuantity(amount.quantity.toString()),
      ]),
    ),
  }

  return yoroiEntry
}

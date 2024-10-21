import _ from 'lodash'

import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {FormattedMetadata, TransactionBody} from '../types'

export const formatMetadata = (unsignedTx: YoroiUnsignedTx, txBody: TransactionBody): FormattedMetadata => {
  const hash = txBody.auxiliary_data_hash ?? null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const msg = unsignedTx.metadata?.['674']?.['msg' as any] ?? JSON.stringify({})

  const metadata = hash != null && typeof msg == 'string' ? {msg: [JSON.parse(msg) as unknown]} : null

  return {
    hash,
    metadata,
  }
}

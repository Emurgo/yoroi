import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {TransactionBody} from '../types'

export const formatMetadata = (unsignedTx: YoroiUnsignedTx, txBody: TransactionBody) => {
  const hash = txBody.auxiliary_data_hash ?? null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metadata = unsignedTx.metadata?.['674']?.['msg' as any] ?? null

  return {
    hash,
    metadata: {msg: [JSON.parse(metadata)]},
  }
}

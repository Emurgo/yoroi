import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {TransactionBody} from '../types'

export const formatMetadata = (unsignedTx: YoroiUnsignedTx, txBody: TransactionBody) => {
  const hash = txBody.auxiliary_data_hash ?? null
  const metadata = unsignedTx.metadata?.['674'] ?? null

  return {
    hash,
    metadata,
  }
}

import {CardanoMobile} from '@yoroi/cardano-wallet'

import * as React from 'react'

import {TransactionBody} from '../types'

export const useTxBody = ({
  cbor,
}: {
  cbor?: string | null
}): TransactionBody | null => {
  return React.useMemo(() => {
    if (cbor != null) {
      return getCborTxBody(cbor)
    }
    return null
  }, [cbor])
}
const getCborTxBody = (cbor: string) => {
  const tx = CardanoMobile.Transaction.fromHex(cbor)
  const jsonString = tx.toJson()
  return JSON.parse(jsonString).body
}

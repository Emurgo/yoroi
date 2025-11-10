import * as React from 'react'

import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'

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
  return CardanoMobileWrapped.cslScope((csl) => {
    const tx = csl.Transaction.fromHex(cbor)
    const jsonString = tx.toJson()
    return JSON.parse(jsonString).body
  })
}

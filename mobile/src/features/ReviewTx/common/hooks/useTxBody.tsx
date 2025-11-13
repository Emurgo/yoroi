import * as React from 'react'

import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'
import {YoroiUnsignedTx} from '~/wallets/types/yoroi'

import {TransactionBody} from '../types'

export const useTxBody = ({
  cbor,
  unsignedTx,
}: {
  cbor?: string | null
  unsignedTx?: YoroiUnsignedTx | null
}): TransactionBody => {
  return React.useMemo(() => {
    if (cbor != undefined) {
      return getCborTxBody(cbor)
    } else if (unsignedTx != undefined) {
      return getUnsignedTxTxBody(unsignedTx)
    } else {
      throw new Error('useTxBody: missing cbor and unsignedTx')
    }
  }, [cbor, unsignedTx])
}
const getCborTxBody = (cbor: string) => {
  return CardanoMobileWrapped.cslScope((csl) => {
    const tx = csl.Transaction.fromHex(cbor)
    const jsonString = tx.toJson()
    return JSON.parse(jsonString).body
  })
}

const getUnsignedTxTxBody = (unsignedTx: YoroiUnsignedTx) => {
  const {
    unsignedTx: {txBody},
  } = unsignedTx
  const txBodyjson = txBody.toJson()
  return JSON.parse(txBodyjson)
}

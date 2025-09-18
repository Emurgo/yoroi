import * as React from 'react'

import {YoroiUnsignedTx} from '~/wallets/types/yoroi'
import {CardanoMobile} from '~/wallets/wallets'

import {TransactionBody} from '../types'

// TODO: REVISIT it can be removed
export const useTxBody = ({
  cbor,
  unsignedTx,
}: {
  cbor?: string | null
  unsignedTx?: YoroiUnsignedTx | null
}): {
  txBody: TransactionBody | null
  isLoading: boolean
  error: Error | null
} => {
  return React.useMemo(() => {
    try {
      // ORDER IS IMPORTANT
      // cbor comes from navigation params and unsigned tx from provider
      // Reason is unsignedTx can change during the CATALYST registration funnel (CIP36)
      // TODO: eliminate the use of unsigned tx entirely
      if (cbor != undefined) {
        const txBody = getCborTxBody(cbor)
        return {
          txBody,
          isLoading: false,
          error: null,
        }
      } else if (unsignedTx != undefined) {
        const txBody = getUnsignedTxTxBody(unsignedTx)
        return {
          txBody,
          isLoading: false,
          error: null,
        }
      } else {
        return {
          txBody: null,
          isLoading: false,
          error: new Error('useTxBody: missing cbor and unsignedTx'),
        }
      }
    } catch (error) {
      return {
        txBody: null,
        isLoading: false,
        error: error as Error,
      }
    }
  }, [cbor, unsignedTx])
}
const getCborTxBody = (cbor: string) => {
  const tx = CardanoMobile.Transaction.fromHex(cbor)
  const jsonString = tx.toJson()
  return JSON.parse(jsonString).body
}

const getUnsignedTxTxBody = (unsignedTx: YoroiUnsignedTx) => {
  const {
    unsignedTx: {txBody},
  } = unsignedTx
  const txBodyjson = txBody.toJson()
  return JSON.parse(txBodyjson)
}

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
    console.log('[useTxBody] Processing transaction body:', {
      hasCbor: !!cbor,
      hasUnsignedTx: !!unsignedTx,
      cborLength: cbor?.length,
    })

    try {
      // ORDER IS IMPORTANT
      // cbor comes from navigation params and unsigned tx from provider
      // Reason is unsignedTx can change during the CATALYST registration funnel (CIP36)
      // TODO: eliminate the use of unsigned tx entirely
      if (cbor != undefined) {
        console.log('[useTxBody] Processing CBOR transaction')
        const txBody = getCborTxBody(cbor)
        console.log('[useTxBody] Successfully parsed CBOR:', {
          inputsCount: txBody.inputs?.length ?? 0,
          outputsCount: txBody.outputs?.length ?? 0,
          fee: txBody.fee,
        })
        return {
          txBody,
          isLoading: false,
          error: null,
        }
      } else if (unsignedTx != undefined) {
        console.log('[useTxBody] Processing unsigned transaction')
        const txBody = getUnsignedTxTxBody(unsignedTx)
        console.log('[useTxBody] Successfully parsed unsigned tx:', {
          inputsCount: txBody.inputs?.length ?? 0,
          outputsCount: txBody.outputs?.length ?? 0,
          fee: txBody.fee,
        })
        return {
          txBody,
          isLoading: false,
          error: null,
        }
      } else {
        console.error('[useTxBody] No transaction data provided')
        return {
          txBody: null,
          isLoading: false,
          error: new Error('useTxBody: missing cbor and unsignedTx'),
        }
      }
    } catch (error) {
      console.error('[useTxBody] Error processing transaction:', error)
      return {
        txBody: null,
        isLoading: false,
        error: error as Error,
      }
    }
  }, [cbor, unsignedTx])
}
const getCborTxBody = (cbor: string) => {
  console.log(
    '[getCborTxBody] Parsing CBOR hex string:',
    cbor.substring(0, 100) + '...',
  )
  const tx = CardanoMobile.Transaction.fromHex(cbor)
  const jsonString = tx.toJson()
  const parsed = JSON.parse(jsonString)
  console.log('[getCborTxBody] CBOR transaction parsed successfully')
  return parsed.body
}

const getUnsignedTxTxBody = (unsignedTx: YoroiUnsignedTx) => {
  console.log('[getUnsignedTxTxBody] Parsing unsigned transaction body')
  const {
    unsignedTx: {txBody},
  } = unsignedTx
  const txBodyjson = txBody.toJson()
  const parsed = JSON.parse(txBodyjson)
  console.log(
    '[getUnsignedTxTxBody] Unsigned transaction body parsed successfully',
  )
  return parsed
}

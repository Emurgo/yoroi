import {isString} from '@yoroi/common'

import {MetadataJsonSchema} from '@emurgo/cross-csl-core'
import * as React from 'react'

import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'
import {YoroiUnsignedTx} from '~/wallets/types/yoroi'

import {FormattedMetadata, TransactionBody} from '../types'

export const formatMetadata = (
  unsignedTx: YoroiUnsignedTx | null,
  cbor: string | null,
  txBody: TransactionBody,
): FormattedMetadata => {
  const hash = txBody.auxiliary_data_hash ?? null
  let metadata = null

  if (
    unsignedTx != null &&
    unsignedTx.unsignedTx.auxiliaryData &&
    hash != null
  ) {
    CardanoMobileWrapped.cslScope((wasm) => {
      const generalTransactionMetadata =
        unsignedTx.unsignedTx.auxiliaryData?.metadata()
      if (generalTransactionMetadata) {
        const metadata674 = generalTransactionMetadata.get(
          csl.BigNum.fromStr('674'),
        )
        if (metadata674) {
          const decodedMetadata = csl.decodeMetadatumToJsonStr(
            metadata674,
            MetadataJsonSchema.BasicConversions,
          )
          const msg = [parseMsg(JSON.parse(decodedMetadata)?.msg ?? [''])]
          metadata = {msg}
        }
      }
    })
  } else if (cbor != null && hash != null) {
    CardanoMobileWrapped.cslScope((wasm) => {
      const tx = csl.Transaction.fromHex(cbor)
      const auxiliaryData = tx.auxiliaryData()
      const txMetadata = auxiliaryData?.metadata()

      if (txMetadata) {
        const metadata674 = txMetadata.get(csl.BigNum.fromStr('674'))
        if (metadata674) {
          const decodedMetadata = csl.decodeMetadatumToJsonStr(
            metadata674,
            MetadataJsonSchema.BasicConversions,
          )
          const msg = [parseMsg(JSON.parse(decodedMetadata)?.msg ?? [''])]
          metadata = {msg}
        }
      }
    })
  }

  return {
    hash,
    metadata,
  }
}

const parseMsg = (msg: Array<string> | string): string => {
  const messageToParse = Array.isArray(msg) ? msg.join('') : msg

  try {
    const parsed: unknown = JSON.parse(messageToParse)
    if (isString(parsed)) return parsed
    return JSON.stringify(parsed)
  } catch {
    return messageToParse
  }
}

export const useFormattedMetadata = ({
  unsignedTx,
  cbor,
  txBody,
}: {
  unsignedTx: YoroiUnsignedTx | null
  cbor: string | null
  txBody: TransactionBody
}) => {
  return React.useMemo(
    () => formatMetadata(unsignedTx, cbor, txBody),
    [unsignedTx, cbor, txBody],
  )
}

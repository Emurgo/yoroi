import {isString} from '@yoroi/common'

import {MetadataJsonSchema} from '@emurgo/cross-csl-core'
import * as React from 'react'

import {YoroiUnsignedTx} from '~/wallets/types/yoroi'
import {CardanoMobile} from '~/wallets/wallets'

import {FormattedMetadata, TransactionBody} from '../types'

export const formatMetadata = (
  unsignedTx: YoroiUnsignedTx | null,
  cbor: string | null,
  txBody: TransactionBody,
): FormattedMetadata => {
  const hash = txBody.auxiliary_data_hash ?? null
  let metadata = null
  let generalTransactionMetadata = null

  if (
    unsignedTx != null &&
    unsignedTx.unsignedTx.auxiliaryData &&
    hash != null
  ) {
    generalTransactionMetadata = unsignedTx.unsignedTx.auxiliaryData?.metadata()
  } else if (cbor != null && hash != null) {
    const tx = CardanoMobile.Transaction.fromHex(cbor)
    const auxiliaryData = tx.auxiliaryData()
    generalTransactionMetadata = auxiliaryData?.metadata()
  }

  const metadata674 = generalTransactionMetadata?.get(
    CardanoMobile.BigNum.fromStr('674'),
  )
  if (metadata674) {
    const decodedMetadata = CardanoMobile.decodeMetadatumToJsonStr(
      metadata674,
      MetadataJsonSchema.BasicConversions,
    )
    const msg = [parseMsg(JSON.parse(decodedMetadata)?.msg ?? [''])]
    metadata = {msg}
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

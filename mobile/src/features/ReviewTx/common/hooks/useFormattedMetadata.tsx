import {isString} from '@yoroi/common'

import {MetadataJsonSchema} from '@emurgo/cross-csl-core'
import * as React from 'react'

import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'

import {FormattedMetadata, TransactionBody} from '../types'

export const formatMetadata = (
  cbor: string | null,
  txBody: TransactionBody,
): FormattedMetadata => {
  const hash = txBody.auxiliary_data_hash ?? null
  let metadata = null

  if (cbor != null && hash != null) {
    CardanoMobileWrapped.cslScope((csl) => {
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
  cbor,
  txBody,
}: {
  cbor: string | null
  txBody: TransactionBody | null
}) => {
  return React.useMemo(() => {
    if (txBody == null) {
      return {hash: null, metadata: null}
    }
    return formatMetadata(cbor, txBody)
  }, [cbor, txBody])
}

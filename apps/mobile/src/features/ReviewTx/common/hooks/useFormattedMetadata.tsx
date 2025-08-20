import {MetadataJsonSchema} from '@emurgo/cross-csl-core'
import {useSuspenseQuery} from '@tanstack/react-query'
import {isString} from '@yoroi/common'

import {wrappedCsl} from '~/wallets/cardano/wrappedCsl'
import {YoroiUnsignedTx} from '~/wallets/types/yoroi'

import {FormattedMetadata, TransactionBody} from '../types'

export const formatMetadata = async (
  unsignedTx: YoroiUnsignedTx | null,
  cbor: string | null,
  txBody: TransactionBody,
): Promise<FormattedMetadata> => {
  const {csl, release} = wrappedCsl()

  try {
    const hash = txBody.auxiliary_data_hash ?? null
    let metadata = null
    let generalTransactionMetadata = null

    if (
      unsignedTx != null &&
      unsignedTx.unsignedTx.auxiliaryData &&
      hash != null
    ) {
      generalTransactionMetadata =
        unsignedTx.unsignedTx.auxiliaryData?.metadata()
    } else if (cbor != null && hash != null) {
      const tx = csl.Transaction.fromHex(cbor)
      const auxiliaryData = tx.auxiliaryData()
      generalTransactionMetadata = auxiliaryData?.metadata()
    }

    const metadata674 = generalTransactionMetadata?.get(
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

    return {
      hash,
      metadata,
    }
  } finally {
    release()
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
  const query = useSuspenseQuery({
    queryFn: () => formatMetadata(unsignedTx, cbor, txBody),
    queryKey: ['useFormattedMetadata', cbor, unsignedTx, txBody],
  })

  return query?.data
}

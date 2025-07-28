import {MetadataJsonSchema} from '@emurgo/cross-csl-core'
import {useQuery} from '@tanstack/react-query'
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
        await unsignedTx.unsignedTx.auxiliaryData?.metadata()
    } else if (cbor != null && hash != null) {
      const tx = await csl.Transaction.fromHex(cbor)
      const auxiliaryData = await tx.auxiliaryData()
      generalTransactionMetadata = await auxiliaryData?.metadata()
    }

    const metadata674 = await generalTransactionMetadata?.get(
      await csl.BigNum.fromStr('674'),
    )
    if (metadata674) {
      const decodedMetadata = await csl.decodeMetadatumToJsonStr(
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
  const query = useQuery({
    queryFn: () => formatMetadata(unsignedTx, cbor, txBody),
    queryKey: ['useFormattedMetadata', cbor, unsignedTx, txBody],
    useErrorBoundary: true,
    suspense: true,
  })

  return query?.data
}

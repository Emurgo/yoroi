import {MetadataJsonSchema} from '@emurgo/cross-csl-core'
import _ from 'lodash'
import {useQuery} from 'react-query'

import {wrappedCsl} from '../../../../yoroi-wallets/cardano/wrappedCsl'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types/yoroi'
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

    if (unsignedTx != null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = unsignedTx.metadata?.['674']?.['msg' as any] ?? JSON.stringify({})
      metadata = hash != null && typeof msg == 'string' ? {msg: [JSON.parse(msg) as unknown]} : null
    } else if (cbor != null) {
      const tx = await csl.Transaction.fromBytes(Buffer.from(cbor, 'hex'))
      const auxiliaryData = await tx.auxiliaryData()
      const generalTransactionMetadata = await auxiliaryData?.metadata()
      const metadata674 = await generalTransactionMetadata?.get(await csl.BigNum.fromStr('674'))

      if (metadata674) {
        const decodedMetadata = await csl.decodeMetadatumToJsonStr(metadata674, MetadataJsonSchema.BasicConversions)
        const msg = JSON.parse(decodedMetadata)?.msg ?? JSON.stringify({})
        metadata = hash != null ? {msg: [msg]} : null
      }
    }

    return {
      hash,
      metadata,
    }
  } finally {
    release()
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

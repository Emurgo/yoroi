import {useQuery} from 'react-query'

import {wrappedCsl} from '../../../../yoroi-wallets/cardano/wrappedCsl'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types/yoroi'

export const useTxBody = ({cbor, unsignedTx}: {cbor?: string; unsignedTx?: YoroiUnsignedTx}) => {
  const query = useQuery(
    ['useTxBody', cbor, unsignedTx],
    async () => {
      if (cbor !== undefined) {
        return getCborTxBody(cbor)
      } else if (unsignedTx !== undefined) {
        return getUnsignedTxTxBody(unsignedTx)
      } else {
        throw new Error('useTxBody: missing cbor and unsignedTx')
      }
    },
    {
      useErrorBoundary: true,
      suspense: true,
    },
  )

  if (query.data === undefined) throw new Error('useTxBody: cannot extract txBody')
  return query.data
}
const getCborTxBody = async (cbor: string) => {
  const {csl, release} = wrappedCsl()
  try {
    const tx = await csl.Transaction.fromHex(cbor)
    const jsonString = await tx.toJson()
    return JSON.parse(jsonString).body
  } finally {
    release()
  }
}

const getUnsignedTxTxBody = async (unsignedTx: YoroiUnsignedTx) => {
  const {
    unsignedTx: {txBody},
  } = unsignedTx
  const txBodyjson = await txBody.toJson()
  return JSON.parse(txBodyjson)
}

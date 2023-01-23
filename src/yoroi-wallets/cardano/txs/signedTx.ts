import {YoroiSignedTx, YoroiTxInfo, YoroiUnsignedTx} from '../../types'
import {CardanoTypes} from '..'

type YoroiSignedTxInfo = {
  unsignedTx: YoroiUnsignedTx
  signedTx: CardanoTypes.SignedTx
}

export const yoroiSignedTx = ({unsignedTx, signedTx}: YoroiSignedTxInfo): YoroiSignedTx => {
  const {unsignedTx: _, ...yoroiTxInfo} = unsignedTx

  return {
    ...(yoroiTxInfo as YoroiTxInfo),
    signedTx,
  }
}

import {YoroiSignedTx, YoroiTxInfo, YoroiUnsignedTx} from '@yoroi/types'
import {CardanoTypes} from './types'

type YoroiSignedTxInfo = {
  unsignedTx: YoroiUnsignedTx
  signedTx: CardanoTypes.SignedTx
}

export const yoroiSignedTx = ({
  unsignedTx,
  signedTx,
}: YoroiSignedTxInfo): YoroiSignedTx => {
  const {unsignedTx: _, ...yoroiTxInfo} = unsignedTx

  return {
    ...(yoroiTxInfo as YoroiTxInfo),
    signedTx,
  }
}

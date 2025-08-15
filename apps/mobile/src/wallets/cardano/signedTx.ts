import {YoroiSignedTx, YoroiTxInfo, YoroiUnsignedTx} from '../types/yoroi'
import {CardanoTypes} from './types'

type YoroiSignedTxInfo = {
  unsignedTx: YoroiUnsignedTx
  signedTx: CardanoTypes.SignedTx
}

export const yoroiSignedTx = ({
  unsignedTx,
  signedTx,
}: YoroiSignedTxInfo): YoroiSignedTx => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {unsignedTx: _unused, ...yoroiTxInfo} = unsignedTx

  return {
    ...(yoroiTxInfo as YoroiTxInfo),
    signedTx,
  }
}

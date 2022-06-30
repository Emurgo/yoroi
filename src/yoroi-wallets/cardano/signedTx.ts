import {SignedTx} from '@emurgo/yoroi-lib-core'

import {YoroiSignedTx, YoroiTxInfo, YoroiUnsignedTx} from '../types'

type YoroiSignedTxInfo = {
  unsignedTx: YoroiUnsignedTx
  signedTx: SignedTx
}

export const yoroiSignedTx = ({unsignedTx, signedTx}: YoroiSignedTxInfo): YoroiSignedTx => {
  const {unsignedTx: _, ...yoroiTxInfo} = unsignedTx

  return {
    ...(yoroiTxInfo as YoroiTxInfo),
    signedTx,
  }
}

Object.assign({})

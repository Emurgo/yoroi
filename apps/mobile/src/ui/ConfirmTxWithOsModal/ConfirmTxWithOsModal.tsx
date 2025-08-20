import * as React from 'react'

import {ConfirmRawTxWithOs} from '~/features/Swap/common/ConfirmRawTx/ConfirmRawTxWithOs'
import {YoroiSignedTx, YoroiUnsignedTx} from '~/wallets/types/yoroi'

type Props = {
  unsignedTx: YoroiUnsignedTx
  onSuccess: (signedTx: YoroiSignedTx) => void
  onError: (error: unknown) => void
}

export const ConfirmTxWithOsModal = ({
  unsignedTx,
  onSuccess,
  onError,
}: Props) => {
  return (
    <ConfirmRawTxWithOs
      unsignedTx={unsignedTx}
      onSuccess={onSuccess}
      onError={onError}
    />
  )
}

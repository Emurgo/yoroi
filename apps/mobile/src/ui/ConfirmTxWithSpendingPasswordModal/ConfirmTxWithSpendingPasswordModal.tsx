import * as React from 'react'

import {ConfirmRawTxWithPassword} from '~/features/Swap/common/ConfirmRawTx/ConfirmRawTxWithPassword'
import {YoroiSignedTx, YoroiUnsignedTx} from '~/wallets/types/yoroi'

type Props = {
  unsignedTx: YoroiUnsignedTx
  onSuccess: (signedTx: YoroiSignedTx) => void
  onError: (error: unknown) => void
}

export const ConfirmTxWithSpendingPasswordModal = ({
  unsignedTx,
  onSuccess,
  onError,
}: Props) => {
  return (
    <ConfirmRawTxWithPassword
      unsignedTx={unsignedTx}
      onSuccess={onSuccess}
      onError={onError}
    />
  )
}

import * as React from 'react'

import {ConfirmRawTxWithHW} from '~/features/ReviewTx/common/ConfirmRawTxWithHw'
import {YoroiSignedTx, YoroiUnsignedTx} from '~/wallets/types/yoroi'

type Props = {
  onCancel?: () => void
  unsignedTx: YoroiUnsignedTx
  onSuccess: (signedTx: YoroiSignedTx) => void
  onNotSupportedCIP1694?: () => void
  onCIP36SupportChange?: (isCIP36Supported: boolean) => void
}

export const ConfirmTxWithHwModal = ({
  onCancel,
  unsignedTx,
  onSuccess,
  onNotSupportedCIP1694,
  onCIP36SupportChange,
}: Props) => {
  return (
    <ConfirmRawTxWithHW
      onCancel={onCancel}
      unsignedTx={unsignedTx}
      onSuccess={onSuccess}
      onNotSupportedCIP1694={onNotSupportedCIP1694}
      onCIP36SupportChange={onCIP36SupportChange}
    />
  )
}

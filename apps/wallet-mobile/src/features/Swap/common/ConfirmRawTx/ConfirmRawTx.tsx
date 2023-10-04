import React from 'react'

import {useSelectedWallet} from '../../../../SelectedWallet'
import {ConfirmRawTxWithHW} from './ConfirmRawTxWithHW'
import {ConfirmRawTxWithOs} from './ConfirmRawTxWithOs'
import {ConfirmRawTxWithPassword} from './ConfirmRawTxWithPassword'

export const ConfirmRawTx = ({
  onConfirm,
  onHWSuccess,
}: {
  onConfirm?: (rootKey: string) => Promise<void>
  onHWSuccess?: VoidFunction
}) => {
  const wallet = useSelectedWallet()

  if (wallet.isHW) {
    return <ConfirmRawTxWithHW onSuccess={onHWSuccess} />
  }

  if (wallet.isEasyConfirmationEnabled) {
    return <ConfirmRawTxWithOs onConfirm={onConfirm} />
  }

  return <ConfirmRawTxWithPassword onConfirm={onConfirm} />
}

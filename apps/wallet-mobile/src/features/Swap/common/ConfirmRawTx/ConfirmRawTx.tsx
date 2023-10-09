import React from 'react'

import {useSelectedWallet} from '../../../../SelectedWallet'
import {ConfirmRawTxWithHW} from './ConfirmRawTxWithHW'
import {ConfirmRawTxWithOs} from './ConfirmRawTxWithOs'
import {ConfirmRawTxWithPassword} from './ConfirmRawTxWithPassword'

export const ConfirmRawTx = ({
  onConfirm,
  onHWConfirm,
}: {
  onConfirm?: (rootKey: string) => Promise<void>
  onHWConfirm?: VoidFunction
}) => {
  const wallet = useSelectedWallet()

  if (wallet.isHW) {
    return <ConfirmRawTxWithHW onSuccess={onHWConfirm} />
  }

  if (wallet.isEasyConfirmationEnabled) {
    return <ConfirmRawTxWithOs onConfirm={onConfirm} />
  }

  return <ConfirmRawTxWithPassword onConfirm={onConfirm} />
}

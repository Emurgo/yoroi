import React from 'react'

import {useSelectedWallet} from '../../../../SelectedWallet'
import {ConfirmRawTxWithHW} from './ConfirmRawTxWithHW'
import {ConfirmRawTxWithOs} from './ConfirmRawTxWithOs'
import {ConfirmRawTxWithPassword} from './ConfirmRawTxWithPassword'

export const ConfirmRawTx = ({onConfirm}: {onConfirm?: (rootKey: string) => Promise<void>}) => {
  const wallet = useSelectedWallet()

  if (wallet.isHW) {
    return <ConfirmRawTxWithHW />
  }

  if (wallet.isEasyConfirmationEnabled) {
    return <ConfirmRawTxWithOs onConfirm={onConfirm} />
  }

  return <ConfirmRawTxWithPassword onConfirm={onConfirm} />
}

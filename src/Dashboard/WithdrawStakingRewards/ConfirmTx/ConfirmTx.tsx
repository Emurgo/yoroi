import React from 'react'

import {useSelectedWallet} from '../../../SelectedWallet'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {ConfirmTxWithHW} from './ConfirmTxWithHW'
import {ConfirmTxWithOS} from './ConfirmTxWithOS'
import {ConfirmTxWithPassword} from './ConfirmTxWithPassword'

type Props = {
  onCancel: () => void
  onSuccess: () => void
  yoroiUnsignedTx: YoroiUnsignedTx
}

export const ConfirmTx: React.FC<Props> = ({onSuccess, onCancel, yoroiUnsignedTx}) => {
  const wallet = useSelectedWallet()

  return wallet.isHW ? (
    <ConfirmTxWithHW //
      yoroiUnsignedTx={yoroiUnsignedTx}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  ) : wallet.isEasyConfirmationEnabled ? (
    <ConfirmTxWithOS //
      yoroiUnsignedTx={yoroiUnsignedTx}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  ) : (
    <ConfirmTxWithPassword //
      yoroiUnsignedTx={yoroiUnsignedTx}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  )
}

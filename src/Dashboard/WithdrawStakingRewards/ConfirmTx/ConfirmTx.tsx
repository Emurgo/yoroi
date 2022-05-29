import React from 'react'

import {YoroiWallet} from '../../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {ConfirmTxWithHW} from './ConfirmTxWithHW'
import {ConfirmTxWithOS} from './ConfirmTxWithOS'
import {ConfirmTxWithPassword} from './ConfirmTxWithPassword'

type Props = {
  onCancel: () => void
  onSuccess: () => void
  yoroiUnsignedTx: YoroiUnsignedTx
  wallet: YoroiWallet
}

export const ConfirmTx: React.FC<Props> = ({wallet, onSuccess, onCancel, yoroiUnsignedTx}) => {
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

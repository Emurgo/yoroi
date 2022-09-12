import {YoroiUnsignedTx, YoroiWallet} from '@yoroi-wallets'
import React from 'react'

import KeyStore from '../../../legacy/KeyStore'
import {ConfirmTxWithHW} from './ConfirmTxWithHW'
import {ConfirmTxWithOS} from './ConfirmTxWithOS'
import {ConfirmTxWithPassword} from './ConfirmTxWithPassword'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  storage: typeof KeyStore
  onCancel: () => void
  onSuccess: () => void
}

export const ConfirmTx = ({wallet, storage, onSuccess, onCancel, unsignedTx}: Props) => {
  return wallet.isHW ? (
    <ConfirmTxWithHW //
      wallet={wallet}
      unsignedTx={unsignedTx}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  ) : wallet.isEasyConfirmationEnabled ? (
    <ConfirmTxWithOS //
      wallet={wallet}
      unsignedTx={unsignedTx}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  ) : (
    <ConfirmTxWithPassword //
      wallet={wallet}
      storage={storage}
      unsignedTx={unsignedTx}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  )
}

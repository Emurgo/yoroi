import React from 'react'

import {EncryptedStorage} from '../../../auth'
import {YoroiWallet} from '../../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {ConfirmTxWithHW} from './ConfirmTxWithHW'
import {ConfirmTxWithOS} from './ConfirmTxWithOS'
import {ConfirmTxWithPassword} from './ConfirmTxWithPassword'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: () => void
  encryptedStorage: EncryptedStorage
}

export const ConfirmTx = ({wallet, onSuccess, onCancel, unsignedTx, encryptedStorage}: Props) => {
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
      unsignedTx={unsignedTx}
      onSuccess={onSuccess}
      onCancel={onCancel}
      encryptedStorage={encryptedStorage}
    />
  )
}

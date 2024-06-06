import React from 'react'

import {useSelectedWalletMeta} from '../../../../features/WalletManager/common/hooks/useSelectedWalletMeta'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {ConfirmTxWithHW} from './ConfirmTxWithHW'
import {ConfirmTxWithOS} from './ConfirmTxWithOS'
import {ConfirmTxWithPassword} from './ConfirmTxWithPassword'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: () => void
}

export const ConfirmTx = ({wallet, onSuccess, onCancel, unsignedTx}: Props) => {
  const meta = useSelectedWalletMeta()
  return wallet.isHW ? (
    <ConfirmTxWithHW //
      wallet={wallet}
      unsignedTx={unsignedTx}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  ) : meta.isEasyConfirmationEnabled ? (
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
    />
  )
}

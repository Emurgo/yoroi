import React from 'react'

import {useSelectedWallet} from '../../../../features/WalletManager/common/hooks/useSelectedWallet'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {ConfirmTxWithHW} from './ConfirmTxWithHW'
import {ConfirmTxWithOS} from './ConfirmTxWithOS'
import {ConfirmTxWithPassword} from './ConfirmTxWithPassword'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: () => void
}

export const ConfirmTx = ({onSuccess, onCancel, unsignedTx}: Props) => {
  const {meta, wallet} = useSelectedWallet()
  return meta.isHW ? (
    <ConfirmTxWithHW //
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

import React from 'react'

import {YoroiWallet} from '../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {ConfirmTxWithHW} from './ConfirmTxWithHW'
import {ConfirmTxWithOS} from './ConfirmTxWithOS'
import {ConfirmTxWithPassword} from './ConfirmTxWithPassword'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onSuccess: () => void
}

export const ConfirmTx = ({wallet, onSuccess, unsignedTx}: Props) => {
  return wallet.isHW ? (
    <ConfirmTxWithHW //
      wallet={wallet}
      unsignedTx={unsignedTx}
      onSuccess={onSuccess}
    />
  ) : wallet.isEasyConfirmationEnabled ? (
    <ConfirmTxWithOS //
      wallet={wallet}
      unsignedTx={unsignedTx}
      onSuccess={onSuccess}
    />
  ) : (
    <ConfirmTxWithPassword //
      wallet={wallet}
      unsignedTx={unsignedTx}
      onSuccess={onSuccess}
    />
  )
}

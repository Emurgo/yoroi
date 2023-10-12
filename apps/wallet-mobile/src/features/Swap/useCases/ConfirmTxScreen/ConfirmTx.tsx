import React from 'react'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {ConfirmTxWithHW} from './ConfirmTxWithHW'
import {ConfirmTxWithPassword} from './ConfirmTxWithPassword'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  additionalFees?: string
  onCancel: () => void
  onSuccess: () => void
}

export const ConfirmTx = ({wallet, onSuccess, onCancel, unsignedTx, additionalFees}: Props) => {
  return wallet.isHW ? (
    <ConfirmTxWithHW //
      wallet={wallet}
      unsignedTx={unsignedTx}
      onSuccess={onSuccess}
      onCancel={onCancel}
      additionalFees={additionalFees}
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

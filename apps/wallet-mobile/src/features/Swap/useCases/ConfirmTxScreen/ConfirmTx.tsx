import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {ModalError} from '../../common/ModalError/ModalError'
import {ConfirmTxWithHW} from './ConfirmTxWithHW'
import {ConfirmTxWithPassword} from './ConfirmTxWithPassword'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: () => void
}

export const ConfirmTx = ({wallet, onSuccess, onCancel, unsignedTx}: Props) => {
  return wallet.isHW ? (
    <ErrorBoundary
      fallbackRender={({error, resetErrorBoundary}) => (
        <ModalError error={error} resetErrorBoundary={resetErrorBoundary} onCancel={onCancel} />
      )}
    >
      <ConfirmTxWithHW //
        wallet={wallet}
        unsignedTx={unsignedTx}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </ErrorBoundary>
  ) : (
    <ConfirmTxWithPassword //
      wallet={wallet}
      unsignedTx={unsignedTx}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  )
}

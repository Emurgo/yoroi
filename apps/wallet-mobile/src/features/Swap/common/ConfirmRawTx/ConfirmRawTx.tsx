import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'

import {useSelectedWallet} from '../../../../SelectedWallet'
import {ModalError} from '../ModalError/ModalError'
import {ConfirmRawTxWithHW} from './ConfirmRawTxWithHW'
import {ConfirmRawTxWithOs} from './ConfirmRawTxWithOs'
import {ConfirmRawTxWithPassword} from './ConfirmRawTxWithPassword'

type Props = {
  onCancel: () => void
  onConfirm?: (rootKey: string) => Promise<void>
  onHWConfirm?: ({useUSB}: {useUSB: boolean}) => Promise<void>
}

export const ConfirmRawTx = ({onConfirm, onHWConfirm, onCancel}: Props) => {
  const wallet = useSelectedWallet()

  if (wallet.isHW) {
    return (
      <ErrorBoundary
        fallbackRender={({error, resetErrorBoundary}) => (
          <ModalError error={error} resetErrorBoundary={resetErrorBoundary} onCancel={onCancel} />
        )}
      >
        <ConfirmRawTxWithHW onConfirm={onHWConfirm} />
      </ErrorBoundary>
    )
  }

  if (wallet.isEasyConfirmationEnabled) {
    return <ConfirmRawTxWithOs onConfirm={onConfirm} />
  }

  return <ConfirmRawTxWithPassword onConfirm={onConfirm} />
}

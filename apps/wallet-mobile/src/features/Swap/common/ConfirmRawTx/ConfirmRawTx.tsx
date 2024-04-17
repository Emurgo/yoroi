import {Swap} from '@yoroi/types'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'

import {ModalError} from '../../../../components/ModalError/ModalError'
import {useSelectedWallet} from '../../../WalletManager/Context/SelectedWalletContext'
import {ConfirmRawTxWithHW} from './ConfirmRawTxWithHW'
import {ConfirmRawTxWithOs} from './ConfirmRawTxWithOs'
import {ConfirmRawTxWithPassword} from './ConfirmRawTxWithPassword'

type Props = {
  onCancel?: () => void
  onConfirm?: (rootKey: string) => Promise<void>
  onHWConfirm?: () => void
  utxo: string
  bech32Address: string
  cancelOrder: Swap.Api['cancelOrder']
}

export const ConfirmRawTx = ({onConfirm, onHWConfirm, onCancel, utxo, bech32Address, cancelOrder}: Props) => {
  const wallet = useSelectedWallet()

  if (wallet.isHW) {
    return (
      <ErrorBoundary
        fallbackRender={({error, resetErrorBoundary}) => (
          <ModalError error={error} resetErrorBoundary={resetErrorBoundary} onCancel={onCancel} />
        )}
      >
        <ConfirmRawTxWithHW
          cancelOrder={cancelOrder}
          onConfirm={onHWConfirm}
          utxo={utxo}
          bech32Address={bech32Address}
        />
      </ErrorBoundary>
    )
  }

  if (wallet.isEasyConfirmationEnabled) {
    return <ConfirmRawTxWithOs onConfirm={onConfirm} />
  }

  return <ConfirmRawTxWithPassword onConfirm={onConfirm} />
}

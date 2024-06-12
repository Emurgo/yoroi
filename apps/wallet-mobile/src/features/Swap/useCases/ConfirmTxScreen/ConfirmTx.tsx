import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'

import {ModalError} from '../../../../components/ModalError/ModalError'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {YoroiSignedTx, YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {useSelectedWalletMeta} from '../../../WalletManager/common/hooks/useSelectedWalletMeta'
import {ConfirmTxWithHW} from './ConfirmTxWithHW'
import {ConfirmTxWithPassword} from './ConfirmTxWithPassword'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: (signedTx: YoroiSignedTx) => void
}

export const ConfirmTx = ({wallet, onSuccess, onCancel, unsignedTx}: Props) => {
  const meta = useSelectedWalletMeta()
  return meta.isHW ? (
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

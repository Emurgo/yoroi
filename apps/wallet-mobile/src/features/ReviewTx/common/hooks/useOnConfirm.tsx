import {Transaction} from '@emurgo/cross-csl-core'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'

import {useModal} from '../../../../components/Modal/ModalContext'
import {ModalError} from '../../../../components/ModalError/ModalError'
import {YoroiSignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {ConfirmRawTxWithHW} from '../../../Swap/common/ConfirmRawTx/ConfirmRawTxWithHW'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateTo} from './useNavigateTo'
import {usePromptRootKey} from './usePromptRootKey'
import {useSignTxWithHW} from './useSignTxWithHW'

export type OnConfirm = {
  cbor?: string | null
  noSubmit?: boolean
  partial?: boolean
  onSuccess?: (args?: {tx?: Transaction; rootKey?: string; signedTx?: YoroiSignedTx}) => void
  onError?: ((error: unknown) => void) | null
  onCancel?: () => void
  onClose?: () => void
}

export const useOnConfirm = ({cbor, partial, noSubmit = false, onSuccess, onError, onCancel, onClose}: OnConfirm) => {
  const {meta} = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const {sign} = useSignTxWithHW()
  const {promptRootKey} = usePromptRootKey()
  const {openModal} = useModal()

  const handleOnSuccess = (args?: {tx?: Transaction; rootKey?: string; signedTx?: YoroiSignedTx}) => {
    if (onSuccess) {
      onSuccess({rootKey: args?.rootKey, tx: args?.tx})
      return
    }

    navigateTo.showSubmittedTxScreen()
  }

  const handleOnError = (error: unknown) => {
    if (onError) {
      onError(error)
      return
    }

    navigateTo.showFailedTxScreen()
  }

  const onConfirm = () => {
    if (meta.isHW && cbor != null && noSubmit) {
      sign({
        cbor,
        partial,
        onCancel,
        onClose,
        onSuccess: (tx: Transaction) => handleOnSuccess({tx}),
        onError: handleOnError,
      })
      return
    }

    console.log('meta.isHW', meta.isHW, cbor)
    if (meta.isHW && cbor != null) {
      openModal({
        title: 'Sign TX',
        content: (
          <ErrorBoundary
            fallbackRender={({error, resetErrorBoundary}) => (
              <ModalError error={error} resetErrorBoundary={resetErrorBoundary} onCancel={onCancel} />
            )}
          >
            <ConfirmRawTxWithHW onSuccess={handleOnSuccess} cbor={cbor} />
          </ErrorBoundary>
        ),
        height: 400,
      })

      return
    }

    if (!meta.isHW && noSubmit) {
      promptRootKey({
        onSuccess: (rootKey: string) => handleOnSuccess({rootKey}),
        onError: handleOnError,
        onClose,
      })
      return
    }

    throw new Error('useOnConfirm:: invalid state')
  }

  return {onConfirm} as const
}

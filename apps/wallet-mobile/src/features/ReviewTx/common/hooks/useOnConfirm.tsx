import {Transaction} from '@emurgo/cross-csl-core'
import {Wallet} from '@yoroi/types'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'

import {useModal} from '../../../../components/Modal/ModalContext'
import {ModalError} from '../../../../components/ModalError/ModalError'
import {getTransactionSigners} from '../../../../yoroi-wallets/cardano/common/signatureUtils'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {createRawTxSigningKey} from '../../../../yoroi-wallets/cardano/utils'
import {YoroiSignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {ConfirmRawTxWithHW} from '../ConfirmRawTxWithHw'
import {useNavigateTo} from './useNavigateTo'
import {usePromptRootKey} from './usePromptRootKey'
import {useSignTxWithHW} from './useSignTxWithHW'
import {useStrings} from './useStrings'

export type OnConfirm = {
  cbor?: string | null
  preventSubmit?: boolean
  partial?: boolean
  onSuccess?: (args?: {tx?: Transaction; rootKey?: string; signedTx?: YoroiSignedTx}) => void
  onError?: ((error: unknown) => void) | null
  onCancel?: () => void
  onClose?: () => void
}

export const useOnConfirm = ({
  cbor,
  partial,
  preventSubmit = false,
  onSuccess,
  onError,
  onCancel,
  onClose,
}: OnConfirm) => {
  const {wallet, meta} = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const {sign} = useSignTxWithHW()
  const {promptRootKey} = usePromptRootKey()
  const {openModal} = useModal()
  const strings = useStrings()

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

  // TODO: Make it homogenic
  const onConfirm = () => {
    if (cbor == null) throw new Error('useOnConfirm:: invalid state')

    if (meta.isHW) {
      if (preventSubmit) {
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

      openModal({
        title: strings.signTransaction,
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

    promptRootKey({
      onSuccess: async (rootKey: string) => {
        if (!preventSubmit) {
          try {
            await submitTx(cbor, rootKey, wallet, meta)
          } catch (e) {
            handleOnError(e)
            return
          }
        }

        handleOnSuccess({rootKey})
      },
      onError: handleOnError,
      onClose,
    })
  }

  return {onConfirm} as const
}

const submitTx = async (cbor: string, rootKey: string, wallet: YoroiWallet, meta: Wallet.Meta) => {
  const signers = await getTransactionSigners(cbor, wallet, meta)
  const keys = await Promise.all(signers.map(async (signer) => createRawTxSigningKey(rootKey, signer)))
  const response = await wallet.signRawTx(cbor, keys)
  if (!response) throw new Error('useOnConfirm:: not possible to sign tx')
  const hexBase64 = Buffer.from(response).toString('base64')
  await wallet.submitTransaction(hexBase64)
}

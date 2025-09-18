import {Wallet} from '@yoroi/types'

import {Transaction} from '@emurgo/cross-csl-core'
import * as React from 'react'
import {ErrorBoundary} from 'react-error-boundary'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {ModalError} from '~/ui/ModalError/ModalError'
import {getTransactionSigners} from '~/wallets/cardano/common/signatureUtils'
import {YoroiWallet} from '~/wallets/cardano/types'
import {createRawTxSigningKey} from '~/wallets/cardano/utils'
import {YoroiSignedTx} from '~/wallets/types/yoroi'

import {ConfirmRawTxWithHW} from '../ConfirmRawTxWithHw'
import {useNavigateTo} from './useNavigateTo'
import {usePromptRootKey} from './usePromptRootKey'
import {useSignTxWithHW} from './useSignTxWithHW'

export type OnConfirm = {
  cbor?: string | null
  preventSubmit?: boolean
  partial?: boolean
  onSuccess?: (args?: {
    tx?: Transaction
    rootKey?: string
    signedTx?: YoroiSignedTx
  }) => void
  onSuccessWithoutFeedback?: (args?: {
    tx?: Transaction
    rootKey?: string
    signedTx?: YoroiSignedTx
  }) => void
  onError?: ((error: unknown) => void) | null
  onErrorWithoutFeedback?: ((error: unknown) => void) | null
  onCancel?: () => void
  onClose?: () => void
  onNotSupportedCIP1694?: (() => void) | null
  onCIP36SupportChange?: ((isCIP36Supported: boolean) => void) | null
}

export const useOnConfirm = ({
  cbor,
  partial,
  preventSubmit = false,
  onSuccess,
  onSuccessWithoutFeedback,
  onError,
  onErrorWithoutFeedback,
  onCancel,
  onClose,
}: OnConfirm) => {
  const {wallet, meta} = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const {sign} = useSignTxWithHW()
  const {promptRootKey} = usePromptRootKey()
  const {openModal} = useModal()
  const strings = useStrings()

  const handleOnSuccess = (args?: {
    tx?: Transaction
    rootKey?: string
    signedTx?: YoroiSignedTx
  }) => {
    if (onSuccessWithoutFeedback) {
      onSuccessWithoutFeedback({rootKey: args?.rootKey, tx: args?.tx})
      return
    }

    if (onSuccess) {
      onSuccess({rootKey: args?.rootKey, tx: args?.tx})
    }

    navigateTo.showSubmittedTxScreen()
  }

  const handleOnError = (error: unknown) => {
    if (onErrorWithoutFeedback) {
      onErrorWithoutFeedback(error)
      return
    }

    if (onError) {
      onError(error)
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
        title: strings.staking.signTransaction,
        content: (
          <ErrorBoundary
            fallbackRender={({error, resetErrorBoundary}) => (
              <ModalError
                error={error}
                resetErrorBoundary={resetErrorBoundary}
                onCancel={onCancel}
              />
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

const submitTx = async (
  cbor: string,
  rootKey: string,
  wallet: YoroiWallet,
  meta: Wallet.Meta,
) => {
  const signers = getTransactionSigners(cbor, wallet, meta)
  const keys = signers.map((signer) => createRawTxSigningKey(rootKey, signer))
  const response = await wallet.signRawTx(cbor, keys)
  if (!response) throw new Error('useOnConfirm:: not possible to sign tx')
  const hexBase64 = Buffer.from(response).toString('base64')
  await wallet.submitTransaction(hexBase64)
}

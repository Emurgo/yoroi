import {calculateTxId} from '@yoroi/tx'
import {Wallet} from '@yoroi/types'

import {Transaction} from '@emurgo/cross-csl-core'
import * as React from 'react'
import {ErrorBoundary} from 'react-error-boundary'

import {useReviewTxMemo} from '~/features/ReviewTx/common/context/ReviewTxMemoContext'
import {useSaveMemo} from '~/features/Transactions/hooks/useSaveMemo'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {ModalError} from '~/ui/ModalError/ModalError'
import {getTransactionSigners} from '~/wallets/cardano/common/signatureUtils'
import {YoroiWallet} from '~/wallets/cardano/types'
import {createRawTxSigningKey} from '~/wallets/cardano/utils'
import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'

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
    signedTx?: Transaction
  }) => void
  onSuccessWithoutFeedback?: (args?: {
    tx?: Transaction
    rootKey?: string
    signedTx?: Transaction
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
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const memoContext = useReviewTxMemo()
  const {saveMemo} = useSaveMemo({wallet})

  const handleOnSuccess = async (args?: {
    tx?: Transaction
    rootKey?: string
    signedTx?: Transaction
    txId?: string
  }) => {
    closeModal()

    // Use signedTx if available, otherwise fall back to tx
    const signedTx = args?.signedTx ?? args?.tx

    // Re-read memo from context at the time of saving (in case it changed)
    const currentMemo = memoContext.memo

    // Save memo if present - txId should always be provided by callers
    if (currentMemo.trim().length > 0 && args?.txId) {
      try {
        await saveMemo({txId: args.txId, memo: currentMemo.trim()})
      } catch (error) {
        logger.error('useOnConfirm: Failed to save memo', {
          txId: args.txId,
          error: error instanceof Error ? error.message : String(error),
        })
        // Silently fail - don't block success flow
      }
    }

    if (onSuccessWithoutFeedback) {
      onSuccessWithoutFeedback({
        rootKey: args?.rootKey,
        tx: args?.tx,
        signedTx,
      })
      return
    }

    if (onSuccess) {
      onSuccess({
        rootKey: args?.rootKey,
        tx: args?.tx,
        signedTx,
      })
    }

    navigateTo.showSubmittedTxScreen()
  }

  const handleOnError = (error: unknown) => {
    closeModal()

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
          onSuccess: async (tx: Transaction) => {
            // Calculate txId from signed transaction immediately
            const txBytes = tx.toBytes()
            const txId = await CardanoMobileWrapped.cslScope(async (csl) => {
              return await calculateTxId(
                csl,
                Buffer.from(txBytes).toString('hex'),
                'hex',
              )
            })
            handleOnSuccess({tx, txId})
          },
          onError: handleOnError,
        })
        return
      }

      openModal({
        title: strings.staking.signTransaction,
        content: (
          <Modal.Content>
            <ErrorBoundary
              fallbackRender={({error, resetErrorBoundary}) => (
                <ModalError
                  error={error}
                  resetErrorBoundary={resetErrorBoundary}
                  onCancel={onCancel}
                />
              )}
            >
              <ConfirmRawTxWithHW
                onSuccess={async () => {
                  // For HW with submit, transaction is already submitted
                  // Calculate txId from unsigned CBOR (body hash is same)
                  const txId = await CardanoMobileWrapped.cslScope(
                    async (csl) => {
                      return await calculateTxId(csl, cbor, 'hex')
                    },
                  )
                  handleOnSuccess({txId})
                }}
                cbor={cbor}
              />
            </ErrorBoundary>
          </Modal.Content>
        ),
        height: 400,
        onClose,
      })

      return
    }

    promptRootKey({
      onSuccess: async (rootKey: string) => {
        if (!preventSubmit) {
          try {
            const result = await submitTx(cbor, rootKey, wallet, meta)
            if (!result)
              throw new Error('useOnConfirm:: not possible to sign tx')
            // txId and signedTx are already calculated in submitTx
            handleOnSuccess({
              rootKey,
              signedTx: result.signedTx,
              txId: result.txId,
            })
            return
          } catch (e) {
            handleOnError(e)
            return
          }
        }

        // For preventSubmit=true, calculate txId from unsigned CBOR
        const txId = await CardanoMobileWrapped.cslScope(async (csl) => {
          return await calculateTxId(csl, cbor, 'hex')
        })
        handleOnSuccess({rootKey, txId})
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
): Promise<{signedTx: Transaction; txId: string} | null> => {
  return CardanoMobileWrapped.cslScope(async (csl) => {
    const signers = await getTransactionSigners(cbor, wallet, meta)
    const keys = signers.map((signer) =>
      createRawTxSigningKey(rootKey, signer, csl),
    )
    const signedTxBytes = await wallet.signRawTx(cbor, keys)
    if (!signedTxBytes) return null

    // Create Transaction object from signed bytes
    const signedTx = csl.Transaction.fromBytes(signedTxBytes)
    if (!signedTx) return null

    // Calculate transaction ID from signed bytes (before submitting)
    const txId = await calculateTxId(
      csl,
      Buffer.from(signedTxBytes).toString('hex'),
      'hex',
    )

    // Submit the transaction
    const hexBase64 = Buffer.from(signedTxBytes).toString('base64')
    await wallet.submitTransaction(hexBase64)

    return {signedTx, txId}
  })
}

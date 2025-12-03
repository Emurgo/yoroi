import {getTransactionSigners} from '@yoroi/cardano-wallet/common/signatureUtils'
import {YoroiWallet} from '@yoroi/cardano-wallet/types'
import {createRawTxSigningKey} from '@yoroi/cardano-wallet/utils'
import {CardanoMobileWrapped} from '@yoroi/cardano-wallet/wrappedCsl'
import {calculateTxId} from '@yoroi/tx'
import {Branded, Wallet} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'

import {Transaction, WasmModuleProxy} from '@emurgo/cross-csl-core'
import * as React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {InteractionManager} from 'react-native'

import {useReviewTxMemo} from '~/features/ReviewTx/common/context/ReviewTxMemoContext'
import {FormattedTx} from '~/features/ReviewTx/common/types'
import {useSaveMemo} from '~/features/Transactions/hooks/useSaveMemo'
import {createOptimisticTransactionFromFormattedTx} from '~/features/Transactions/utils/createOptimisticTransaction'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {ModalError} from '~/ui/ModalError/ModalError'
import {OperationContext} from '~/ui/ResultScreen/types'

import {ConfirmRawTxWithHW} from '../ConfirmRawTxWithHw'
import {useNavigateTo} from './useNavigateTo'
import {usePromptRootKey} from './usePromptRootKey'
import {useSignTxWithHW} from './useSignTxWithHW'

export type OnConfirm = {
  cbor?: string | null
  preventSubmit?: boolean
  partial?: boolean
  context?: OperationContext
  formattedTx?: FormattedTx | null
  onSuccess?: (args?: {
    tx?: Transaction
    rootKey?: string
    signedTx?: Transaction | ((csl: WasmModuleProxy) => Transaction)
    txId?: string
  }) => void
  onSuccessWithoutFeedback?: (args?: {
    tx?: Transaction
    rootKey?: string
    signedTx?: Transaction | ((csl: WasmModuleProxy) => Transaction)
    txId?: string
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
  context,
  formattedTx,
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
    signedTx?: Transaction | ((csl: WasmModuleProxy) => Transaction)
    txId?: string
  }) => {
    try {
      closeModal()

      // Use signedTx if available, otherwise fall back to tx
      // If signedTx is a function, it will be called within a CSL scope when needed
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

      // Use InteractionManager to ensure navigation happens after modal closes
      InteractionManager.runAfterInteractions(async () => {
        try {
          if (onSuccessWithoutFeedback) {
            try {
              await onSuccessWithoutFeedback({
                rootKey: args?.rootKey,
                tx: args?.tx,
                signedTx,
                txId: args?.txId,
              })
            } catch (error) {
              logger.error(
                'useOnConfirm: onSuccessWithoutFeedback callback failed',
                {
                  error: error instanceof Error ? error.message : String(error),
                  txId: args?.txId,
                },
              )
              // Don't block success flow - transaction was already submitted
            }
            return
          }

          if (onSuccess) {
            try {
              await onSuccess({
                rootKey: args?.rootKey,
                tx: args?.tx,
                signedTx,
                txId: args?.txId,
              })
            } catch (error) {
              logger.error('useOnConfirm: onSuccess callback failed', {
                error: error instanceof Error ? error.message : String(error),
                txId: args?.txId,
              })
              // Don't block success flow - transaction was already submitted
            }
          }

          navigateTo.showSubmittedTxScreen(context)
        } catch (error) {
          logger.error('useOnConfirm: Unexpected error in handleOnSuccess', {
            error: error instanceof Error ? error.message : String(error),
            txId: args?.txId,
            context,
          })
          // Even if there's an unexpected error, try to show success screen
          // since transaction was already submitted
          try {
            navigateTo.showSubmittedTxScreen(context)
          } catch (navError) {
            logger.error(
              'useOnConfirm: Failed to show success screen after error',
              {
                error:
                  navError instanceof Error
                    ? navError.message
                    : String(navError),
              },
            )
          }
        }
      })
    } catch (error) {
      logger.error('useOnConfirm: Unexpected error in handleOnSuccess', {
        error: error instanceof Error ? error.message : String(error),
        txId: args?.txId,
        context,
      })
      // Even if there's an unexpected error, try to show success screen
      // since transaction was already submitted
      InteractionManager.runAfterInteractions(() => {
        try {
          navigateTo.showSubmittedTxScreen(context)
        } catch (navError) {
          logger.error(
            'useOnConfirm: Failed to show success screen after error',
            {
              error:
                navError instanceof Error ? navError.message : String(navError),
            },
          )
        }
      })
    }
  }

  const handleOnError = (error: unknown) => {
    closeModal()

    // Log error details for debugging
    logger.error('useOnConfirm: Transaction failed', {
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      context,
      cborLength: cbor?.length,
      preventSubmit,
      partial,
    })

    // Use InteractionManager to ensure navigation happens after modal closes
    InteractionManager.runAfterInteractions(() => {
      try {
        if (onErrorWithoutFeedback) {
          onErrorWithoutFeedback(error)
          return
        }

        if (onError) {
          onError(error)
        }

        navigateTo.showFailedTxScreen(context)
      } catch (callbackError) {
        logger.error('useOnConfirm: Error in handleOnError callbacks', {
          error:
            callbackError instanceof Error
              ? callbackError.message
              : String(callbackError),
          originalError: error instanceof Error ? error.message : String(error),
        })
        // Ensure navigation happens even if callbacks fail
        try {
          navigateTo.showFailedTxScreen(context)
        } catch (navError) {
          logger.error('useOnConfirm: Failed to navigate to error screen', {
            error:
              navError instanceof Error ? navError.message : String(navError),
          })
        }
      }
    })
  }

  // TODO: Make it homogenic
  const onConfirm = () => {
    if (cbor == null) throw new Error('useOnConfirm:: invalid state')

    // Block read-only wallets from signing transactions
    if (meta.isReadOnly) {
      handleOnError(new Error('Read-only wallets cannot sign transactions'))
      return
    }

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
                onCancel={() => {
                  closeModal()
                  onCancel?.()
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

            // Add optimistic transaction if formattedTx is available
            if (formattedTx && result.txId) {
              try {
                const currentMemo = memoContext.memo
                const optimisticTx = createOptimisticTransactionFromFormattedTx(
                  formattedTx,
                  result.txId,
                  currentMemo.trim().length > 0 ? currentMemo.trim() : null,
                )
                wallet.addOptimisticTransaction(optimisticTx)
                logger.debug('useOnConfirm: Added optimistic transaction', {
                  txId: result.txId,
                  walletId: wallet.id,
                })
              } catch (optimisticError) {
                logger.error(
                  'useOnConfirm: Failed to add optimistic transaction',
                  {
                    error:
                      optimisticError instanceof Error
                        ? optimisticError.message
                        : String(optimisticError),
                    txId: result.txId,
                    walletId: wallet.id,
                  },
                )
                // Don't fail the submission if optimistic update fails
              }
            }

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
): Promise<{
  signedTx: (csl: WasmModuleProxy) => Transaction
  txId: string
} | null> => {
  const result = await CardanoMobileWrapped.cslScope(async (csl) => {
    const signers = await getTransactionSigners(cbor, wallet, meta)
    const keys = signers.map((signer) =>
      createRawTxSigningKey(rootKey, signer, csl),
    )
    const signedTxBytes = await wallet.signRawTx(cbor, keys)
    if (!signedTxBytes) {
      logger.error('submitTx: Failed to sign transaction')
      return null
    }

    // Calculate transaction ID from signed bytes (before submitting)
    const txId = await calculateTxId(
      csl,
      Buffer.from(signedTxBytes).toString('hex'),
      'hex',
    )

    // Submit the transaction (convert to base64 for API)
    const signedTxBase64 = Branded.asTransactionCborBase64(
      Buffer.from(signedTxBytes).toString('base64'),
    )
    try {
      await wallet.submitTransaction(signedTxBase64)
      logger.debug('submitTx: Transaction submitted successfully', {txId})
    } catch (submitError) {
      logger.error('submitTx: Failed to submit transaction', {
        error:
          submitError instanceof Error
            ? submitError.message
            : String(submitError),
        errorStack:
          submitError instanceof Error ? submitError.stack : undefined,
        txId,
        cborLength: cbor.length,
      })
      throw submitError
    }

    return {signedTxBytes, txId}
  })

  if (!result) {
    return null
  }

  // Return a function that recreates the Transaction from bytes when called with a CSL instance
  // This allows callbacks to recreate the Transaction within their own CSL scope
  const signedTx = (csl: WasmModuleProxy) => {
    const tx = csl.Transaction.fromBytes(result.signedTxBytes)
    if (!tx) {
      throw new Error('Failed to recreate Transaction from bytes')
    }
    return tx
  }

  return {signedTx, txId: result.txId}
}

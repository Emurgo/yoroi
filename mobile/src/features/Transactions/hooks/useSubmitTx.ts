import {TxSubmissionStatus} from '@yoroi/api'
import {YoroiWallet} from '@yoroi/cardano-wallet'
import {delay} from '@yoroi/cardano-wallet'
import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'
import {useMutationWithInvalidations} from '@yoroi/common'
import {calculateTxId} from '@yoroi/tx'
import {Branded} from '@yoroi/types'
import {useWalletManagerSelector} from '@yoroi/wallet-manager/context/WalletManagerProvider'

import * as CSL from '@emurgo/cross-csl-core'
import {UseMutationOptions} from '@tanstack/react-query'

import {FormattedTx} from '~/features/ReviewTx/common/types'
import {logger} from '~/kernel/logger/logger'

import {createOptimisticTransactionFromFormattedTx} from '../utils/createOptimisticTransaction'

export const useSubmitTx = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<TxSubmissionStatus, Error, CSL.Transaction> & {
    formattedTx?: FormattedTx
    memo?: string | null
  } = {},
) => {
  const {formattedTx, memo, ...mutationOptions} = options
  // Use selector to prevent re-renders when selected wallet changes
  const walletManager = useWalletManagerSelector((ctx) => ctx.walletManager)

  const mutation = useMutationWithInvalidations({
    mutationFn: async (signedTx) => {
      const serverStatus = await wallet.checkServerStatus()
      const txBytes = signedTx.toBytes()
      const base64 = Branded.asTransactionCborBase64(
        Buffer.from(txBytes).toString('base64'),
      )

      let txId: string | undefined
      try {
        // Calculate txId before submission for better error tracking
        txId = await CardanoMobileWrapped.cslScope(async (csl) => {
          return await calculateTxId(
            csl,
            Buffer.from(txBytes).toString('hex'),
            'hex',
          )
        })
        logger.debug('useSubmitTx: Submitting transaction', {
          txId,
          walletId: wallet.id,
          queueOnline: serverStatus.isQueueOnline,
        })
      } catch (error) {
        logger.error(
          'useSubmitTx: Failed to calculate txId before submission',
          {
            error: error instanceof Error ? error.message : String(error),
          },
        )
        // Continue with submission even if txId calculation fails
      }

      try {
        await wallet.submitTransaction(base64)
        logger.debug('useSubmitTx: Transaction submitted successfully', {
          txId,
          walletId: wallet.id,
        })

        // Add optimistic transaction if formattedTx is provided
        if (formattedTx && txId) {
          try {
            const optimisticTx = createOptimisticTransactionFromFormattedTx(
              formattedTx,
              txId,
              memo ?? null,
            )
            wallet.addOptimisticTransaction(optimisticTx)
            logger.debug('useSubmitTx: Added optimistic transaction', {
              txId,
              walletId: wallet.id,
            })
          } catch (optimisticError) {
            logger.error('useSubmitTx: Failed to add optimistic transaction', {
              error:
                optimisticError instanceof Error
                  ? optimisticError.message
                  : String(optimisticError),
              txId,
              walletId: wallet.id,
            })
            // Don't fail the submission if optimistic update fails
          }
        }
      } catch (submitError) {
        logger.error('useSubmitTx: Failed to submit transaction', {
          error:
            submitError instanceof Error
              ? submitError.message
              : String(submitError),
          errorStack:
            submitError instanceof Error ? submitError.stack : undefined,
          txId,
          walletId: wallet.id,
          queueOnline: serverStatus.isQueueOnline,
        })
        throw submitError
      }

      if (serverStatus.isQueueOnline) {
        if (!txId) {
          txId = await CardanoMobileWrapped.cslScope(async (csl) => {
            return await calculateTxId(
              csl,
              Buffer.from(txBytes).toString('hex'),
              'hex',
            )
          })
        }

        // Notify sync manager about transaction submission for fast polling
        if (txId && walletManager) {
          walletManager.notifyTransactionSubmitted(wallet.id, txId)
        }

        return fetchTxStatus(wallet, txId, false)
      }

      // Even if queue is offline, calculate txId and notify sync manager
      // This ensures fast polling when queue comes back online
      if (!txId) {
        try {
          txId = await CardanoMobileWrapped.cslScope(async (csl) => {
            return await calculateTxId(
              csl,
              Buffer.from(txBytes).toString('hex'),
              'hex',
            )
          })
        } catch (error) {
          logger.error(
            'useSubmitTx: Failed to calculate txId after submission',
            {
              error: error instanceof Error ? error.message : String(error),
              walletId: wallet.id,
            },
          )
          // Ignore errors calculating txId - sync will still work
        }
      }

      if (txId && walletManager) {
        walletManager.notifyTransactionSubmitted(wallet.id, txId)
      }

      return {
        status: 'SUCCESS',
      } as TxSubmissionStatus
    },
    invalidateQueries: [[wallet.id, 'pendingTxs']],
    ...mutationOptions,
  })

  return {
    submitTx: mutation.mutate,
    ...mutation,
  }
}

const txQueueRetryDelay = process.env.NODE_ENV === 'test' ? 1 : 1000
const txQueueRetryTimes = 5
const fetchTxStatus = async (
  wallet: YoroiWallet,
  txHash: string,
  waitProcessing = false,
): Promise<TxSubmissionStatus> => {
  const txHashBranded = Branded.asTransactionHash(txHash)
  for (let i = txQueueRetryTimes; i > 0; i -= 1) {
    const txStatus = await wallet.fetchTxStatus({
      txHashes: [txHashBranded],
    })

    const confirmations = txStatus.depth?.[txHashBranded] || 0
    const submission: TxSubmissionStatus | undefined =
      txStatus.submissionStatus?.[txHashBranded]

    // processed
    if (confirmations > 0) {
      return {
        status: 'SUCCESS',
      }
    }

    // not processed and not in the queue
    if (!submission) {
      await delay(txQueueRetryDelay)
      continue
    }

    // if awaiting to process
    if (submission.status === 'WAITING' && waitProcessing) {
      await delay(txQueueRetryDelay)
      continue
    }

    return submission
  }

  // no submission info or waited and didn't process
  return {
    status: 'WAITING',
  }
}

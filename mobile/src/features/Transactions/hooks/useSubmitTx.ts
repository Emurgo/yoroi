import {TxSubmissionStatus} from '@yoroi/api'
import {useMutationWithInvalidations} from '@yoroi/common'
import {calculateTxId} from '@yoroi/tx'

import * as CSL from '@emurgo/cross-csl-core'
import {UseMutationOptions} from '@tanstack/react-query'

import {useWalletManagerSelector} from '~/features/WalletManager/context/WalletManagerProvider'
import {YoroiWallet} from '~/wallets/cardano/types'
import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'
import {delay} from '~/wallets/utils/timeUtils'

export const useSubmitTx = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<TxSubmissionStatus, Error, CSL.Transaction> = {},
) => {
  // Use selector to prevent re-renders when selected wallet changes
  const walletManager = useWalletManagerSelector((ctx) => ctx.walletManager)

  const mutation = useMutationWithInvalidations({
    mutationFn: async (signedTx) => {
      const serverStatus = await wallet.checkServerStatus()
      const txBytes = signedTx.toBytes()
      const base64 = Buffer.from(txBytes).toString('base64')
      await wallet.submitTransaction(base64)

      let txId: string | undefined

      if (serverStatus.isQueueOnline) {
        txId = await CardanoMobileWrapped.cslScope(async (csl) => {
          return await calculateTxId(
            csl,
            Buffer.from(txBytes).toString('hex'),
            'hex',
          )
        })

        // Notify sync manager about transaction submission for fast polling
        if (txId && walletManager) {
          walletManager.notifyTransactionSubmitted(wallet.id, txId)
        }

        return fetchTxStatus(wallet, txId, false)
      }

      // Even if queue is offline, calculate txId and notify sync manager
      // This ensures fast polling when queue comes back online
      try {
        txId = await CardanoMobileWrapped.cslScope(async (csl) => {
          return await calculateTxId(
            csl,
            Buffer.from(txBytes).toString('hex'),
            'hex',
          )
        })
        if (txId && walletManager) {
          walletManager.notifyTransactionSubmitted(wallet.id, txId)
        }
      } catch (error) {
        // Ignore errors calculating txId - sync will still work
      }

      return {
        status: 'SUCCESS',
      } as TxSubmissionStatus
    },
    invalidateQueries: [[wallet.id, 'pendingTxs']],
    ...options,
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
  for (let i = txQueueRetryTimes; i > 0; i -= 1) {
    const txStatus = await wallet.fetchTxStatus({
      txHashes: [txHash],
    })

    const confirmations = txStatus.depth?.[txHash] || 0
    const submission: TxSubmissionStatus | undefined =
      txStatus.submissionStatus?.[txHash]

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

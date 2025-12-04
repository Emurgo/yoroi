import {YoroiWallet} from '@yoroi/cardano-wallet'

import * as React from 'react'
import {InteractionManager} from 'react-native'

import {walletTransactionToSummary} from '../common/transactionSummary'
import {TransactionSummary} from '../common/types'

/**
 * Hook to get transaction summaries for list display
 * Converts WalletTransaction[] to TransactionSummary[]
 *
 * Uses lazy loading to prevent blocking the initial render.
 * This is especially important for wallets with many transactions.
 */
export const useTransactionSummaries = ({
  wallet,
}: {
  wallet: YoroiWallet
}): Record<string, TransactionSummary> => {
  // Start with empty summaries to allow immediate render
  // Processing happens asynchronously after mount
  const [summaries, setSummaries] = React.useState<
    Record<string, TransactionSummary>
  >({})

  // Process transactions function
  const processTransactions = React.useCallback(() => {
    const rawTxs = wallet.getRawTransactions()
    const ownAddresses =
      wallet.rewardAddressHex !== ''
        ? [
            ...wallet.internalAddresses(),
            ...wallet.externalAddresses(),
            wallet.rewardAddressHex,
          ]
        : [...wallet.internalAddresses(), ...wallet.externalAddresses()]

    // Convert to summaries
    const result: Record<string, TransactionSummary> = {}
    for (const [id, tx] of Object.entries(rawTxs)) {
      result[id] = walletTransactionToSummary(
        tx,
        ownAddresses,
        wallet.portfolioPrimaryTokenInfo,
      )
    }
    setSummaries(result)
  }, [wallet])

  React.useEffect(() => {
    // Process transactions after mount (non-blocking)
    // Use InteractionManager to defer processing until after interactions complete
    // This allows the UI to render immediately while processing happens in background
    const interactionHandle = InteractionManager.runAfterInteractions(() => {
      // Use setTimeout to ensure this runs on next tick, allowing render to complete
      setTimeout(() => {
        processTransactions()
      }, 0)
    })

    return () => {
      interactionHandle.cancel()
    }
  }, [processTransactions, wallet.id])

  React.useEffect(() => {
    const unsubscribe = wallet.subscribe((event) => {
      if (event.type !== 'transactions') return

      // Optimize: Only process new/changed transactions instead of reprocessing everything
      // This significantly improves performance during refresh, especially for wallets with many transactions
      setSummaries((currentSummaries) => {
        const rawTxs = wallet.getRawTransactions()
        const ownAddresses =
          wallet.rewardAddressHex !== ''
            ? [
                ...wallet.internalAddresses(),
                ...wallet.externalAddresses(),
                wallet.rewardAddressHex,
              ]
            : [...wallet.internalAddresses(), ...wallet.externalAddresses()]

        // Start with existing summaries
        const result: Record<string, TransactionSummary> = {...currentSummaries}

        // Only process transactions that are new or changed
        for (const [id, tx] of Object.entries(rawTxs)) {
          const existingSummary = currentSummaries[id]
          const txLastUpdated = tx.lastUpdatedAt

          // Process if:
          // 1. Transaction is new (not in current summaries)
          // 2. Transaction status changed (pending -> confirmed, etc.)
          // 3. Transaction was updated (lastUpdatedAt changed)
          if (
            !existingSummary ||
            existingSummary.status !== tx.status ||
            existingSummary.lastUpdatedAt !== txLastUpdated
          ) {
            result[id] = walletTransactionToSummary(
              tx,
              ownAddresses,
              wallet.portfolioPrimaryTokenInfo,
            )
          }
        }

        // Remove transactions that no longer exist (shouldn't happen, but handle edge cases)
        const currentTxIds = new Set(Object.keys(rawTxs))
        for (const id of Object.keys(result)) {
          if (!currentTxIds.has(id)) {
            delete result[id]
          }
        }

        return result
      })
    })
    return () => {
      unsubscribe?.()
    }
  }, [wallet])

  return summaries
}

import * as React from 'react'

import {YoroiWallet} from '~/wallets/cardano/types'

import {walletTransactionToSummary} from '../common/transactionSummary'
import {TransactionSummary} from '../common/types'

/**
 * Hook to get transaction summaries for list display
 * Converts WalletTransaction[] to TransactionSummary[]
 */
export const useTransactionSummaries = ({
  wallet,
}: {
  wallet: YoroiWallet
}): Record<string, TransactionSummary> => {
  const [summaries, setSummaries] = React.useState<
    Record<string, TransactionSummary>
  >(() => {
    // Get all raw transactions
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
    return result
  })

  React.useEffect(() => {
    const unsubscribe = wallet.subscribe((event) => {
      if (event.type !== 'transactions') return

      // Get all raw transactions
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
    })
    return () => unsubscribe?.()
  }, [wallet])

  return summaries
}

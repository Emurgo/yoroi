import {YoroiWallet} from '@yoroi/cardano-wallet'
import {WalletTransaction} from '@yoroi/types'

import * as React from 'react'

/**
 * Modern replacement for useTransactionInfos.
 * Returns wallet transactions as WalletTransaction objects instead of deprecated TransactionInfo.
 *
 * @deprecated useTransactionInfos - Use this hook instead for new code.
 * This hook uses wallet.getRawTransactions() which returns WalletTransaction (modern type)
 * instead of wallet.transactions which returns TransactionInfo (deprecated type).
 */
export const useWalletTransactions = ({
  wallet,
}: {
  wallet: YoroiWallet
}): Record<string, WalletTransaction> => {
  const [transactions, setTransactions] = React.useState(() =>
    wallet.getRawTransactions(),
  )

  React.useEffect(() => {
    const unsubscribe = wallet.subscribe((event) => {
      if (event.type !== 'transactions') return

      setTransactions(() => wallet.getRawTransactions())
    })
    return () => unsubscribe?.()
  }, [wallet])

  return transactions
}

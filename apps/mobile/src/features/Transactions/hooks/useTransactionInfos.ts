import * as React from 'react'

import {YoroiWallet} from '~/wallets/cardano/types'

export const useTransactionInfos = ({wallet}: {wallet: YoroiWallet}) => {
  const [transactionInfos, setTransactionInfos] = React.useState(
    () => wallet.transactions,
  )

  React.useEffect(() => {
    const unsubscribe = wallet.subscribe((event) => {
      if (event.type !== 'transactions') return

      setTransactionInfos(() => wallet.transactions)
    })
    return () => unsubscribe?.()
  }, [wallet])

  return transactionInfos
}

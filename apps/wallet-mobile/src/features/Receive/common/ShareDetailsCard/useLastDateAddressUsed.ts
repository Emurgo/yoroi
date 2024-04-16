import * as React from 'react'
import {useIntl} from 'react-intl'

import {useSelectedWallet} from '../../../WalletManager/Context/SelectedWalletContext'

export const useLastDateAddressUsed = (address: string) => {
  const wallet = useSelectedWallet()
  const intl = useIntl()
  return React.useMemo(() => {
    const lastUsed = Object.values(wallet.transactions).reduce((currentLast, tx) => {
      const {inputs, outputs} = tx
      const isRelevant = inputs.some((v) => address === v.address) || outputs.some((v) => address === v.address)
      if (!isRelevant) return currentLast
      const lastUpdatedAt = new Date(tx.lastUpdatedAt).getTime()

      return Math.max(currentLast, lastUpdatedAt)
    }, 0)

    return lastUsed
      ? intl.formatDate(new Date(lastUsed), {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : null
  }, [address, intl, wallet.transactions])
}

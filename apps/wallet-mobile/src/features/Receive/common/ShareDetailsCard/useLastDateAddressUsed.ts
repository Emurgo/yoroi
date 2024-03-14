import {useMemo} from 'react'

import {useSelectedWallet} from '../../../../SelectedWallet'

export const useLastDateAddressUsed = (address: string) => {
  const wallet = useSelectedWallet()
  return useMemo(
    () =>
      Object.values(wallet.transactions).reduce((currentLast, tx) => {
        const {inputs, outputs} = tx
        const isRelevant = inputs.some((v) => address === v.address) || outputs.some((v) => address === v.address)
        if (!isRelevant) return currentLast
        const lastUpdatedAt = new Date(tx.lastUpdatedAt).getTime()

        return Math.max(currentLast, lastUpdatedAt)
      }, 0),
    [address, wallet.transactions],
  )
}

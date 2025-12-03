import * as React from 'react'

import {WalletEvent, YoroiWallet} from '@yoroi/cardano-wallet/types'

export const useWalletEvent = (
  wallet: YoroiWallet | null,
  event: WalletEvent['type'],
  callback: () => void,
) => {
  React.useEffect(() => {
    if (!wallet) return

    const unsubWallet = wallet.subscribe((subscriptionEvent) => {
      if (subscriptionEvent.type !== event) return
      callback()
    })

    return () => {
      unsubWallet()
    }
  }, [event, wallet, callback])
}

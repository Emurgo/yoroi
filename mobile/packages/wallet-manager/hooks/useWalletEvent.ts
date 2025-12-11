import {WalletEvent, YoroiWallet} from '@yoroi/cardano-wallet'

import * as React from 'react'

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

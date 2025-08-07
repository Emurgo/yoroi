import * as React from 'react'

import {WalletEvent, YoroiWallet} from '~/wallets/cardano/types'

export const useWalletEvent = (
  wallet: YoroiWallet,
  event: WalletEvent['type'],
  callback: () => void,
) => {
  React.useEffect(() => {
    const unsubWallet = wallet.subscribe((subscriptionEvent) => {
      if (subscriptionEvent.type !== event) return
      callback()
    })

    return () => {
      unsubWallet()
    }
  }, [event, wallet, callback])
}

import * as React from 'react'

import {WalletEvent, YoroiWallet} from '~/wallets/cardano/types'

import {useWalletEvent} from './useWalletEvent'

export const useWallet = (wallet: YoroiWallet, event: WalletEvent['type']) => {
  const [_, rerender] = React.useState({})
  const callback = React.useCallback(() => rerender({}), [])
  useWalletEvent(wallet, event, callback)
}

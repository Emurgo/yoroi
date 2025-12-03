import {WalletEvent, YoroiWallet} from '@yoroi/cardano-wallet/types'

import * as React from 'react'

import {useWalletEvent} from './useWalletEvent'

export const useWallet = (wallet: YoroiWallet, event: WalletEvent['type']) => {
  const [, rerender] = React.useState({})
  const callback = React.useCallback(() => rerender({}), [])
  useWalletEvent(wallet, event, callback)
}

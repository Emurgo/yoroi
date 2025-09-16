import * as React from 'react'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {usePromise} from '~/hooks/usePromise'

import {useWalletManager} from '../context/WalletManagerProvider'
import {useSelectedWallet} from './useSelectedWallet'

export const useDisableEasyConfirmation = () => {
  const {walletManager} = useWalletManager()
  const {wallet} = useSelectedWallet()
  const {authWithHost} = useAuth()

  const disableEasyConfirmation = React.useCallback(async () => {
    const hasAuthenticated = await authWithHost()
    if (hasAuthenticated)
      return walletManager.disableEasyConfirmation(wallet.id)
  }, [walletManager, wallet, authWithHost])

  const promise = usePromise({
    promise: disableEasyConfirmation,
  })

  return {
    ...promise,
    disableEasyConfirmation: promise.resolve,
  }
}

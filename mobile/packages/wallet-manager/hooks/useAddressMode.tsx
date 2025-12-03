import * as React from 'react'

import {useWalletManagerSelector} from '../context/WalletManagerProvider'
import {useSelectedWallet} from './useSelectedWallet'

export const useAddressMode = () => {
  // Use selector to get walletManager without re-rendering on context changes
  const walletManager = useWalletManagerSelector((ctx) => ctx.walletManager)
  const {
    meta: {id, addressMode},
  } = useSelectedWallet()

  return React.useMemo(() => {
    if (!walletManager) {
      throw new Error('WalletManager not available')
    }
    const enableMultipleMode = () =>
      walletManager.changeWalletAddressMode(id, 'multiple')
    const enableSingleMode = () =>
      walletManager.changeWalletAddressMode(id, 'single')

    const toggle = () => {
      if (addressMode === 'single') {
        enableMultipleMode()
      } else {
        enableSingleMode()
      }
    }

    const isSingle = addressMode === 'single'
    const isMultiple = addressMode === 'multiple'

    return {
      isMultiple,
      isSingle,
      addressMode,
      toggle,
      enableSingleMode,
      enableMultipleMode,
    }
  }, [addressMode, walletManager, id])
}

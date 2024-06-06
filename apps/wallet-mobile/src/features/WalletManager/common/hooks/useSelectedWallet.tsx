import * as React from 'react'

import {logger} from '../../../../kernel/logger/logger'
import {useWalletManager} from '../../context/WalletManagerProvider'

export const useSelectedWallet = () => {
  const {
    selected: {wallet},
  } = useWalletManager()

  return React.useMemo(() => {
    if (!wallet) {
      const error = new Error('useSelectedWallet wallet is not set when expected, invalid state reached')
      logger.error(error)
      throw error
    }

    return wallet
  }, [wallet])
}

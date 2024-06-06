import * as React from 'react'

import {logger} from '../../../../kernel/logger/logger'
import {useWalletManager} from '../../context/WalletManagerProvider'

export const useSelectedWalletMeta = () => {
  const {
    selected: {meta},
  } = useWalletManager()

  return React.useMemo(() => {
    if (!meta) {
      const error = new Error('useSelectedWalletMeta meta is not set when expected, invalid state reached')
      logger.error(error)
      throw error
    }

    return meta
  }, [meta])
}

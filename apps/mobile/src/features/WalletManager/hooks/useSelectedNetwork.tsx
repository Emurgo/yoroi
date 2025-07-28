import * as React from 'react'

import {freeze} from 'immer'

import {useWalletManager} from '../context/WalletManagerProvider'

export const useSelectedNetwork = () => {
  const {
    selected: {network, networkManager},
  } = useWalletManager()

  return React.useMemo(() => {
    return freeze({
      network,
      networkManager,
    })
  }, [network, networkManager])
}

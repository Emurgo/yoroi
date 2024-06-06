import * as React from 'react'

import {useWalletManager} from '../../context/WalletManagerProvider'

export const useSelectedNetwork = () => {
  const {
    selected: {network},
  } = useWalletManager()

  return React.useMemo(() => {
    return network
  }, [network])
}

import {useObservableValue} from '@yoroi/common'
import * as React from 'react'

import {useWalletManager} from '../../context/WalletManagerProvider'

export const useHasWallets = () => {
  const {walletManager} = useWalletManager()
  const observable$ = React.useMemo(() => walletManager.walletMetas$, [walletManager])
  const getter = React.useCallback(() => walletManager.hasWallets, [walletManager])

  return useObservableValue({
    observable$,
    getter,
  })
}

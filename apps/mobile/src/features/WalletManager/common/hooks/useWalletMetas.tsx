import {useObservableValue} from '@yoroi/common'
import {Wallet} from '@yoroi/types'
import * as React from 'react'

import {useWalletManager} from '../../context/WalletManagerProvider'

export const useWalletMetas = () => {
  const {walletManager} = useWalletManager()
  const observable$ = React.useMemo(() => walletManager.walletMetas$, [walletManager])
  const getter = React.useCallback(() => Array.from(walletManager.walletMetas.values()).sort(byName), [walletManager])

  return useObservableValue({
    observable$,
    getter,
  })
}

function byName(a: {name: Wallet.Meta['name']}, b: {name: Wallet.Meta['name']}) {
  const nameA = a.name.toUpperCase()
  const nameB = b.name.toUpperCase()

  if (nameA < nameB) {
    return -1
  }
  if (nameA > nameB) {
    return 1
  }

  return 0
}

import * as React from 'react'

import {useWalletManager} from '../../context/WalletManagerProvider'

export const useHasWallets = () => {
  const {walletManager} = useWalletManager()
  const [hasWallets, setHasWallets] = React.useState(walletManager.hasWallets)

  React.useEffect(() => {
    const sub = walletManager.walletMetas$.subscribe(() => {
      setHasWallets(() => walletManager.hasWallets)
    })

    return () => sub.unsubscribe()
  })

  return hasWallets
}

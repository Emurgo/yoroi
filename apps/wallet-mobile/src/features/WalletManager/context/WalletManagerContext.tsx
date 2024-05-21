import * as React from 'react'

import {WalletManager} from '../common/walletManager'

const WalletManagerContext = React.createContext<WalletManager | undefined>(undefined)

export const WalletManagerProvider: React.FC<React.PropsWithChildren<{walletManager: WalletManager}>> = ({
  children,
  walletManager,
}) => {
  React.useEffect(() => {
    walletManager.startSyncingAllWallets()
  }, [walletManager])

  return <WalletManagerContext.Provider value={walletManager}>{children}</WalletManagerContext.Provider>
}

export const useWalletManager = () => React.useContext(WalletManagerContext) || missingProvider()

const missingProvider = () => {
  throw new Error('WalletManagerProvider is missing')
}

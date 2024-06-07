import * as React from 'react'

import {buildPortfolioTokenManagers} from '../../features/Portfolio/common/helpers/build-token-managers'
import {WalletMeta} from '../../features/WalletManager/common/types'
import {WalletManagerProvider} from '../../features/WalletManager/context/WalletManagerProvider'
import {buildNetworkManagers} from '../../features/WalletManager/network-manager/network-manager'
import {WalletManager} from '../../features/WalletManager/wallet-manager'
import {rootStorage} from '../../kernel/storage/rootStorage'
import {YoroiWallet} from '../cardano/types'
import {mocks} from './wallet'

// TODO: should be mocked
const {tokenManagers} = buildPortfolioTokenManagers()
const networkManagers = buildNetworkManagers({tokenManagers})
const walletManagerMock = new WalletManager({
  rootStorage,
  networkManagers,
})

// NOTE: for places that are using the selected directly is ok, but for places using manager
// it needs to be hydrated with the walletManager otherwise it will always return undefined
export const WalletManagerProviderMock = ({
  children,
  wallet = mocks.wallet,
  meta = mocks.walletMeta,
  walletManager = walletManagerMock,
}: {
  children: React.ReactNode
  wallet?: YoroiWallet
  meta?: WalletMeta
  walletManager?: WalletManager
}) => {
  return (
    <WalletManagerProvider
      walletManager={walletManager}
      initialState={{
        selected: {
          network: wallet.networkManager.network,
          wallet,
          meta,
        },
      }}
    >
      {children}
    </WalletManagerProvider>
  )
}

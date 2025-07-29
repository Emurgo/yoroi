import {buildNetworkManagers} from '@yoroi/blockchains'
import {Wallet} from '@yoroi/types'
import * as React from 'react'

import {buildPortfolioTokenManagers} from '../../features/Portfolio/common/helpers/build-token-managers'
import {WalletManagerProvider} from '../../features/WalletManager/context/WalletManagerProvider'
import {WalletManager} from '../../features/WalletManager/wallet-manager'
import {walletMocks} from '../../features/WalletManager/wallet.mock'
import {logger} from '../../kernel/logger/logger'
import {rootStorage} from '../../kernel/storage/storages'
import {YoroiWallet} from '../cardano/types'

// TODO: should be mocked
const {tokenManagers} = buildPortfolioTokenManagers()
const networkManagers = buildNetworkManagers({tokenManagers, logger})
export const walletManagerMock = new WalletManager({
  rootStorage,
  networkManagers,
})

walletManagerMock.setSelectedWalletId(walletMocks.wallet.id)

// NOTE: for places that are using the selected directly is ok, but for places using manager
// it needs to be hydrated with the walletManager otherwise it will always return undefined
export const WalletManagerProviderMock = ({
  children,
  wallet = walletMocks.wallet,
  meta = walletMocks.walletMeta,
  walletManager = walletManagerMock,
}: {
  children: React.ReactNode
  wallet?: YoroiWallet
  meta?: Wallet.Meta
  walletManager?: WalletManager
}) => {
  return (
    <WalletManagerProvider
      walletManager={walletManager}
      initialState={{
        selected: {
          network: wallet.networkManager.network,
          networkManager: networkManagers[wallet.networkManager.network],
          wallet,
          meta,
        },
      }}
    >
      {children}
    </WalletManagerProvider>
  )
}

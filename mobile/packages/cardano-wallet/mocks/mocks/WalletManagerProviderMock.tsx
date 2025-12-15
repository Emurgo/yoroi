import {Wallet} from '@yoroi/types'
import {
  type WalletManager,
  WalletManagerProvider,
  walletMocks,
} from '@yoroi/wallet-manager'

import * as React from 'react'

import type {YoroiWallet} from '../../types'

// NOTE: for places that are using the selected directly is ok, but for places using manager
// it needs to be hydrated with the walletManager otherwise it will always return undefined
export const WalletManagerProviderMock = ({
  children,
  wallet = walletMocks.wallet,
  meta = walletMocks.walletMeta,
  walletManager,
}: {
  children: React.ReactNode
  wallet?: YoroiWallet
  meta?: Wallet.Meta
  walletManager?: WalletManager
}) => {
  if (!walletManager) {
    throw new Error('WalletManagerProviderMock: walletManager is required')
  }

  return (
    <WalletManagerProvider
      walletManager={walletManager}
      initialState={{
        selected: {
          network: wallet.networkManager.network,
          networkManager: wallet.networkManager,
          wallet,
          meta,
        },
      }}
    >
      {children}
    </WalletManagerProvider>
  )
}

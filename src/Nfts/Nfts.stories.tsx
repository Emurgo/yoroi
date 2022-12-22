import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {YoroiWallet} from '../yoroi-wallets'
import {StakePoolInfosAndHistories} from '../yoroi-wallets/types'
import {Nfts} from './Nfts'

storiesOf('Nfts', module)
  .add('Loading', () => {
    const loadingWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.loading,
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={loadingWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('Loaded', () => {
    const loadedWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: () => Promise.resolve({isRegistered: true, poolKeyHash: mocks.stakePoolId}),
      fetchPoolInfo: () =>
        Promise.resolve({[mocks.stakePoolId]: mocks.poolInfoAndHistory} as StakePoolInfosAndHistories),
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('Error', () => {
    const loadedWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: () => Promise.resolve({isRegistered: true, poolKeyHash: mocks.stakePoolId}),
      fetchPoolInfo: mocks.fetchPoolInfo.error,
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })

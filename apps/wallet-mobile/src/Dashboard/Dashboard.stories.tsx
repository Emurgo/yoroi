import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {QueryProvider} from '../../.storybook/decorators'
import {SelectedWalletProvider} from '../features/WalletManager/Context'
import {YoroiWallet} from '../yoroi-wallets/cardano/types'
import {mocks} from '../yoroi-wallets/mocks'
import {Dashboard} from './Dashboard'

storiesOf('Dashboard', module)
  .add('not delegating', () => {
    const notDelegatingWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.notRegistered,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={notDelegatingWallet}>
          <Dashboard />
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loading ids', () => {
    const loadingWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.loading,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadingWallet}>
          <Dashboard />
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loading StakePoolInfo', () => {
    const loadingWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.delegating,
      fetchPoolInfo: mocks.fetchPoolInfo.loading,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadingWallet}>
          <Dashboard />
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded, StakePoolInfo success', () => {
    const loadedWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.delegating,
      fetchPoolInfo: mocks.fetchPoolInfo.success.poolFound,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Dashboard />
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Error', () => {
    const loadedWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.delegating,
      fetchPoolInfo: mocks.fetchPoolInfo.error,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Dashboard />
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded, StakePoolInfo not found', () => {
    const loadedWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.delegating,
      fetchPoolInfo: mocks.fetchPoolInfo.success.poolNotFound,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Dashboard />
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })

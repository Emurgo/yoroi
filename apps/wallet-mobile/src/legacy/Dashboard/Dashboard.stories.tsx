import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {QueryProvider} from '../../../.storybook/decorators'
import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {mocks} from '../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {Dashboard} from './Dashboard'

storiesOf('Dashboard', module)
  .add('not delegating', () => {
    const notDelegatingWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.notRegistered,
    }

    return (
      <QueryProvider>
        <WalletManagerProviderMock wallet={notDelegatingWallet}>
          <Dashboard />
        </WalletManagerProviderMock>
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
        <WalletManagerProviderMock wallet={loadingWallet}>
          <Dashboard />
        </WalletManagerProviderMock>
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
        <WalletManagerProviderMock wallet={loadingWallet}>
          <Dashboard />
        </WalletManagerProviderMock>
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
        <WalletManagerProviderMock wallet={loadedWallet}>
          <Dashboard />
        </WalletManagerProviderMock>
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
        <WalletManagerProviderMock wallet={loadedWallet}>
          <Dashboard />
        </WalletManagerProviderMock>
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
        <WalletManagerProviderMock wallet={loadedWallet}>
          <Dashboard />
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })

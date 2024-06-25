import {storiesOf} from '@storybook/react-native'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import React from 'react'

import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {mocks} from '../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {StakePoolInfos} from './StakePoolInfos'

storiesOf('StakePoolInfos', module)
  .add('not delegating', () => {
    const notDelegatingWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.registered,
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <WalletManagerProviderMock wallet={notDelegatingWallet}>
          <StakePoolInfos />
        </WalletManagerProviderMock>
      </QueryClientProvider>
    )
  })

  .add('Loaded, StakePoolInfo success', () => {
    const loadedWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.delegating,
      fetchPoolInfo: mocks.fetchPoolInfo.success.poolFound,
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <WalletManagerProviderMock wallet={loadedWallet}>
          <StakePoolInfos />
        </WalletManagerProviderMock>
      </QueryClientProvider>
    )
  })

  .add('Error', () => {
    const loadedWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.delegating,
      fetchPoolInfo: mocks.fetchPoolInfo.error,
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <WalletManagerProviderMock wallet={loadedWallet}>
          <StakePoolInfos />
        </WalletManagerProviderMock>
      </QueryClientProvider>
    )
  })
  .add('Loaded, StakePoolInfo not found', () => {
    const loadedWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.delegating,
      fetchPoolInfo: mocks.fetchPoolInfo.success.poolNotFound,
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <WalletManagerProviderMock wallet={loadedWallet}>
          <StakePoolInfos />
        </WalletManagerProviderMock>
      </QueryClientProvider>
    )
  })

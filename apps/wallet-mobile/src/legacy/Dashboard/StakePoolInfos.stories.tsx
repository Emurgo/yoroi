import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {SelectedWalletProvider} from '../../features/WalletManager/context/SelectedWalletContext'
import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {mocks} from '../../yoroi-wallets/mocks'
import {StakePoolInfos} from './StakePoolInfos'

storiesOf('StakePoolInfos', module)
  .add('not delegating', () => {
    const notDelegatingWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.registered,
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={notDelegatingWallet}>
          <StakePoolInfos />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })

  .add('Loading ids', () => {
    const loadingWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.loading,
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={loadingWallet}>
          <StakePoolInfos />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })

  .add('Loading StakePoolInfo', () => {
    const loadingWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.delegating,
      fetchPoolInfo: mocks.fetchPoolInfo.loading,
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={loadingWallet}>
          <StakePoolInfos />
        </SelectedWalletProvider>
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
        <SelectedWalletProvider wallet={loadedWallet}>
          <StakePoolInfos />
        </SelectedWalletProvider>
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
        <SelectedWalletProvider wallet={loadedWallet}>
          <StakePoolInfos />
        </SelectedWalletProvider>
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
        <SelectedWalletProvider wallet={loadedWallet}>
          <StakePoolInfos />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })

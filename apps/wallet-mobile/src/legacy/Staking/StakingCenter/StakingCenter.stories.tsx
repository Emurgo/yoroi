import {storiesOf} from '@storybook/react-native'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import React from 'react'

import {SelectedWalletProvider} from '../../../features/WalletManager/context/SelectedWalletContext'
import {mocks} from '../../../yoroi-wallets/mocks'
import {StakingCenter} from './StakingCenter'

storiesOf('StakingCenter', module)
  .add('loaded', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider
        wallet={{
          ...mocks.wallet,
          networkId: 1,
          createDelegationTx: mocks.createDelegationTx.success,
        }}
      >
        <StakingCenter />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))
  .add('loading', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider
        wallet={{
          ...mocks.wallet,
          networkId: 1,
          createDelegationTx: mocks.createDelegationTx.loading,
        }}
      >
        <StakingCenter />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))
  .add('error', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider
        wallet={{
          ...mocks.wallet,
          networkId: 1,
          createDelegationTx: mocks.createDelegationTx.error,
        }}
      >
        <StakingCenter />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))

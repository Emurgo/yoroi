import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {StakingCenter} from './StakingCenter'

storiesOf('StakingCenter', module)
  .add('loaded', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider
        wallet={{
          ...mocks.wallet,
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
          createDelegationTx: mocks.createDelegationTx.error,
        }}
      >
        <StakingCenter />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))

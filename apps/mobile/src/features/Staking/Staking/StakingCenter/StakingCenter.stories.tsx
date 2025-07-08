import {storiesOf} from '@storybook/react-native'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import React from 'react'

import {mocks} from '../../../wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../wallets/mocks/WalletManagerProviderMock'
import {StakingCenter} from './StakingCenter'

storiesOf('StakingCenter', module)
  .add('loaded', () => (
    <QueryClientProvider client={new QueryClient()}>
      <WalletManagerProviderMock
        wallet={{
          ...mocks.wallet,
          createDelegationTx: mocks.createDelegationTx.success,
        }}
      >
        <StakingCenter />
      </WalletManagerProviderMock>
    </QueryClientProvider>
  ))
  .add('loading', () => (
    <QueryClientProvider client={new QueryClient()}>
      <WalletManagerProviderMock
        wallet={{
          ...mocks.wallet,
          createDelegationTx: mocks.createDelegationTx.loading,
        }}
      >
        <StakingCenter />
      </WalletManagerProviderMock>
    </QueryClientProvider>
  ))
  .add('error', () => (
    <QueryClientProvider client={new QueryClient()}>
      <WalletManagerProviderMock
        wallet={{
          ...mocks.wallet,
          createDelegationTx: mocks.createDelegationTx.error,
        }}
      >
        <StakingCenter />
      </WalletManagerProviderMock>
    </QueryClientProvider>
  ))

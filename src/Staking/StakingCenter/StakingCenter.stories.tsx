import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mockWallet, mockYoroiTx} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {StakingCenter} from './StakingCenter'

storiesOf('StakingCenter', module)
  .add('loaded', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider
        wallet={{
          ...mockWallet,
          networkId: 1,
          createDelegationTx: async (...args) => {
            action('createDelegationTx')(...args)

            return mockYoroiTx
          },
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
          ...mockWallet,
          networkId: 1,
          createDelegationTx: async () => new Promise(() => undefined),
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
          ...mockWallet,
          networkId: 1,
          createDelegationTx: async () => Promise.reject(new Error('createDelegationTx: error message')),
        }}
      >
        <StakingCenter />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))

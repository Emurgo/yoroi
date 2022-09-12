import {storiesOf} from '@storybook/react-native'
import {YoroiWallet} from '@yoroi-wallets'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mockWallet, poolInfoAndHistory, stakePoolId} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {StakePoolInfosAndHistories} from '../types'
import {StakePoolInfos} from './StakePoolInfos'

storiesOf('StakePoolInfos', module)
  .add('not delegating', () => {
    const notDelegatingWallet: YoroiWallet = {
      ...mockWallet,
      getDelegationStatus: () => Promise.resolve({isRegistered: false, poolKeyHash: null}),
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
      ...mockWallet,
      getDelegationStatus: () => new Promise((_resolve, _reject) => undefined), // never resolves
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
      ...mockWallet,
      getDelegationStatus: () => Promise.resolve({isRegistered: true, poolKeyHash: stakePoolId}),
      fetchPoolInfo: () => new Promise((_resolve, _reject) => undefined), // never resolves
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
      ...mockWallet,
      getDelegationStatus: () => Promise.resolve({isRegistered: true, poolKeyHash: stakePoolId}),
      fetchPoolInfo: () => Promise.resolve({[stakePoolId]: poolInfoAndHistory} as StakePoolInfosAndHistories),
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
      ...mockWallet,
      getDelegationStatus: () => Promise.resolve({isRegistered: true, poolKeyHash: stakePoolId}),
      fetchPoolInfo: () => Promise.reject('unknown error'),
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
      ...mockWallet,
      getDelegationStatus: () => Promise.resolve({isRegistered: true, poolKeyHash: stakePoolId}),
      fetchPoolInfo: () => Promise.resolve({[stakePoolId]: null}),
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={loadedWallet}>
          <StakePoolInfos />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })

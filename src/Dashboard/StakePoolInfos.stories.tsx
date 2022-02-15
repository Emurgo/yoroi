import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mockWallet, poolInfoAndHistory, stakePoolId} from '../../storybook/mockWallet'
import {SelectedWalletProvider} from '../SelectedWallet'
import {StakePoolInfosAndHistories, WalletInterface} from '../types'
import {StakePoolInfos} from './StakePoolInfos'

storiesOf('StakePoolInfos', module)
  .add('not delegating', () => {
    const notDelegatingWallet: WalletInterface = {
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
    const loadingWallet: WalletInterface = {
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
    const loadingWallet: WalletInterface = {
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
    const loadedWallet: WalletInterface = {
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

  .add('Loaded, StakePoolInfo error', () => {
    const loadedWallet: WalletInterface = {
      ...mockWallet,
      getDelegationStatus: () => Promise.resolve({isRegistered: true, poolKeyHash: stakePoolId}),
      fetchPoolInfo: () =>
        Promise.resolve({
          [stakePoolId]: {error: new Error('Pool operator not found')},
        } as StakePoolInfosAndHistories),
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={loadedWallet}>
          <StakePoolInfos />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })

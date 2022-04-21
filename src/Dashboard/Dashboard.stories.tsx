import {storiesOf} from '@storybook/react-native'
import BigNumber from 'bignumber.js'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'
import {Provider} from 'react-redux'

import {mockWallet, poolInfoAndHistory, stakePoolId} from '../../storybook'
import getConfiguredStore from '../legacy/configureStore'
import {SelectedWalletProvider} from '../SelectedWallet'
import {StakePoolInfosAndHistories} from '../types'
import {YoroiWallet} from '../yoroi-wallets'
import {Dashboard} from './Dashboard'

const mockedAccountState = {
  isDelegating: false,
  isFetching: false,
  lastFetchingError: '',
  poolOperator: null,
  totalDelegated: new BigNumber(0),
  value: new BigNumber(0),
}

storiesOf('Dashboard', module)
  .add('not delegating', () => {
    const store = getConfiguredStore(true, true, {accountState: mockedAccountState})

    const notDelegatingWallet: YoroiWallet = {
      ...mockWallet,
      getDelegationStatus: () => Promise.resolve({isRegistered: false, poolKeyHash: null}),
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <Provider store={store}>
          <SelectedWalletProvider wallet={notDelegatingWallet}>
            <Dashboard />
          </SelectedWalletProvider>
        </Provider>
      </QueryClientProvider>
    )
  })
  .add('Loading ids', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {...mockedAccountState, isDelegating: true, poolOperator: stakePoolId},
    })

    const loadingWallet: YoroiWallet = {
      ...mockWallet,
      getDelegationStatus: () => new Promise((_resolve, _reject) => undefined), // never resolves
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <Provider store={store}>
          <SelectedWalletProvider wallet={loadingWallet}>
            <Dashboard />
          </SelectedWalletProvider>
        </Provider>
      </QueryClientProvider>
    )
  })
  .add('Loading StakePoolInfo', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {...mockedAccountState, isDelegating: true, poolOperator: stakePoolId},
    })

    const loadingWallet: YoroiWallet = {
      ...mockWallet,
      getDelegationStatus: () => Promise.resolve({isRegistered: true, poolKeyHash: stakePoolId}),
      fetchPoolInfo: () => new Promise((_resolve, _reject) => undefined), // never resolves
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <Provider store={store}>
          <SelectedWalletProvider wallet={loadingWallet}>
            <Dashboard />
          </SelectedWalletProvider>
        </Provider>
      </QueryClientProvider>
    )
  })
  .add('Loaded, StakePoolInfo success', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {...mockedAccountState, isDelegating: true, poolOperator: stakePoolId},
    })

    const loadedWallet: YoroiWallet = {
      ...mockWallet,
      getDelegationStatus: () => Promise.resolve({isRegistered: true, poolKeyHash: stakePoolId}),
      fetchPoolInfo: () => Promise.resolve({[stakePoolId]: poolInfoAndHistory} as StakePoolInfosAndHistories),
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <Provider store={store}>
          <SelectedWalletProvider wallet={loadedWallet}>
            <Dashboard />
          </SelectedWalletProvider>
        </Provider>
      </QueryClientProvider>
    )
  })
  .add('Loaded, StakePoolInfo error', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {...mockedAccountState, isDelegating: true, poolOperator: stakePoolId},
    })

    const loadedWallet: YoroiWallet = {
      ...mockWallet,
      getDelegationStatus: () => Promise.resolve({isRegistered: true, poolKeyHash: stakePoolId}),
      fetchPoolInfo: () =>
        Promise.resolve({
          [stakePoolId]: {error: new Error('Pool operator not found')},
        } as StakePoolInfosAndHistories),
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <Provider store={store}>
          <SelectedWalletProvider wallet={loadedWallet}>
            <Dashboard />
          </SelectedWalletProvider>
        </Provider>
      </QueryClientProvider>
    )
  })

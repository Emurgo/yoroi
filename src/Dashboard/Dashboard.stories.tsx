import {storiesOf} from '@storybook/react-native'
import BigNumber from 'bignumber.js'
import React from 'react'
import {Provider} from 'react-redux'

import {mocks, QueryProvider} from '../../storybook'
import getConfiguredStore from '../legacy/configureStore'
import {SelectedWalletProvider} from '../SelectedWallet'
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
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.notRegistered,
    }

    return (
      <QueryProvider>
        <Provider store={store}>
          <SelectedWalletProvider wallet={notDelegatingWallet}>
            <Dashboard />
          </SelectedWalletProvider>
        </Provider>
      </QueryProvider>
    )
  })
  .add('Loading ids', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {...mockedAccountState, isDelegating: true, poolOperator: mocks.stakePoolId},
    })

    const loadingWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.loading,
    }

    return (
      <QueryProvider>
        <Provider store={store}>
          <SelectedWalletProvider wallet={loadingWallet}>
            <Dashboard />
          </SelectedWalletProvider>
        </Provider>
      </QueryProvider>
    )
  })
  .add('Loading StakePoolInfo', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {...mockedAccountState, isDelegating: true, poolOperator: mocks.stakePoolId},
    })

    const loadingWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.delegating,
      fetchPoolInfo: mocks.fetchPoolInfo.loading,
    }

    return (
      <QueryProvider>
        <Provider store={store}>
          <SelectedWalletProvider wallet={loadingWallet}>
            <Dashboard />
          </SelectedWalletProvider>
        </Provider>
      </QueryProvider>
    )
  })
  .add('Loaded, StakePoolInfo success', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {...mockedAccountState, isDelegating: true, poolOperator: mocks.stakePoolId},
    })

    const loadedWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.delegating,
      fetchPoolInfo: mocks.fetchPoolInfo.success.poolFound,
    }

    return (
      <QueryProvider>
        <Provider store={store}>
          <SelectedWalletProvider wallet={loadedWallet}>
            <Dashboard />
          </SelectedWalletProvider>
        </Provider>
      </QueryProvider>
    )
  })
  .add('Error', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {...mockedAccountState, isDelegating: true, poolOperator: mocks.stakePoolId},
    })

    const loadedWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.delegating,
      fetchPoolInfo: mocks.fetchPoolInfo.error,
    }

    return (
      <QueryProvider>
        <Provider store={store}>
          <SelectedWalletProvider wallet={loadedWallet}>
            <Dashboard />
          </SelectedWalletProvider>
        </Provider>
      </QueryProvider>
    )
  })
  .add('Loaded, StakePoolInfo not found', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {...mockedAccountState, isDelegating: true, poolOperator: mocks.stakePoolId},
    })

    const loadedWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: mocks.getDelegationStatus.success.delegating,
      fetchPoolInfo: mocks.fetchPoolInfo.success.poolNotFound,
    }

    return (
      <QueryProvider>
        <Provider store={store}>
          <SelectedWalletProvider wallet={loadedWallet}>
            <Dashboard />
          </SelectedWalletProvider>
        </Provider>
      </QueryProvider>
    )
  })

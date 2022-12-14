import {storiesOf} from '@storybook/react-native'
import BigNumber from 'bignumber.js'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'
import {Provider} from 'react-redux'

import {mocks} from '../../storybook'
import getConfiguredStore from '../legacy/configureStore'
import {SelectedWalletProvider} from '../SelectedWallet'
import {YoroiWallet} from '../yoroi-wallets'
import {StakePoolInfosAndHistories} from '../yoroi-wallets/types'
import {Nfts} from './Nfts'

const mockedAccountState = {
  isDelegating: false,
  isFetching: false,
  lastFetchingError: '',
  poolOperator: null,
  totalDelegated: new BigNumber(0),
  value: new BigNumber(0),
}

storiesOf('Nfts', module)
  .add('Loading', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {...mockedAccountState, isDelegating: true, poolOperator: mocks.stakePoolId},
    })

    const loadingWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: () => new Promise((_resolve, _reject) => undefined), // never resolves
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <Provider store={store}>
          <SelectedWalletProvider wallet={loadingWallet}>
            <Nfts />
          </SelectedWalletProvider>
        </Provider>
      </QueryClientProvider>
    )
  })
  .add('Loaded', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {...mockedAccountState, isDelegating: true, poolOperator: mocks.stakePoolId},
    })

    const loadedWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: () => Promise.resolve({isRegistered: true, poolKeyHash: mocks.stakePoolId}),
      fetchPoolInfo: () =>
        Promise.resolve({[mocks.stakePoolId]: mocks.poolInfoAndHistory} as StakePoolInfosAndHistories),
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <Provider store={store}>
          <SelectedWalletProvider wallet={loadedWallet}>
            <Nfts />
          </SelectedWalletProvider>
        </Provider>
      </QueryClientProvider>
    )
  })
  .add('Error', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {...mockedAccountState, isDelegating: true, poolOperator: mocks.stakePoolId},
    })

    const loadedWallet: YoroiWallet = {
      ...mocks.wallet,
      getDelegationStatus: () => Promise.resolve({isRegistered: true, poolKeyHash: mocks.stakePoolId}),
      fetchPoolInfo: () => Promise.reject('unknown error'),
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <Provider store={store}>
          <SelectedWalletProvider wallet={loadedWallet}>
            <Nfts />
          </SelectedWalletProvider>
        </Provider>
      </QueryClientProvider>
    )
  })

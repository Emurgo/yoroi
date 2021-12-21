/* eslint-disable @typescript-eslint/no-explicit-any */
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'
import {Provider} from 'react-redux'

import getConfiguredStore from '../../legacy/helpers/configureStore'
import {RemotePoolMetaSuccess} from '../../legacy/selectors'
import {SelectedWalletProvider} from '../SelectedWallet'
import {PoolInfoResponse, RemotePoolMetaFailure, WalletInterface} from '../types'
import {Dashboard} from './Dashboard'

storiesOf('Dashboard', module)
  .add('not delegating', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {
        isDelegating: false,
      },
    })
    const notDelegatingWallet: WalletInterface = {
      ...mockWallet,
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
  .add('Loading', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {
        isDelegating: true,
        poolOperator,
      },
    })
    const loadingWallet: WalletInterface = {
      ...mockWallet,
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
  .add('Loaded, single pool success', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {isDelegating: true, poolOperator},
    })

    const poolInfoResponse = {
      [poolOperator]: poolInfo,
    } as PoolInfoResponse

    const loadedWallet: WalletInterface = {
      ...mockWallet,
      fetchPoolInfo: () => Promise.resolve(poolInfoResponse),
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
  .add('Loaded, single pool error', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {isDelegating: true, poolOperator},
    })

    const poolInfoResponse = {
      [poolOperatorWithError]: poolInfoWithError,
    } as PoolInfoResponse

    const loadedWallet: WalletInterface = {
      ...mockWallet,
      fetchPoolInfo: () => Promise.resolve(poolInfoResponse),
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
  .add('Loaded, multiple pools', () => {
    const store = getConfiguredStore(true, true, {
      accountState: {isDelegating: true, poolOperator},
    })

    const poolInfoResponse = {
      [poolOperator]: poolInfo,
      ['poolOperator']: poolInfo,
      [poolOperatorWithError]: poolInfoWithError,
    } as PoolInfoResponse

    const loadedWallet: WalletInterface = {
      ...mockWallet,
      fetchPoolInfo: () => Promise.resolve(poolInfoResponse),
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

const poolOperator = 'pool-operator-hash'
const poolInfo: RemotePoolMetaSuccess = {
  info: {
    ticker: 'EMUR1',
    name: 'Emurgo #1',
    description:
      'EMURGO is a multinational blockchain technology company providing solutions for developers, startups, enterprises, and governments.',
    homepage: 'https://emurgo.io',
  },
  history: [
    {
      epoch: 6,
      slot: 36343,
      tx_ordinal: 0,
      cert_ordinal: 0,
      payload: {
        kind: 'PoolRegistration',
        certIndex: 123,
        poolParams: {},
      },
    },
  ],
}

const poolOperatorWithError = 'poolOperatorWithError'
const poolInfoWithError: RemotePoolMetaFailure = {
  error: new Error('Pool operator not found'),
}

const mockWallet: WalletInterface = {
  id: 'wallet-id',
  walletImplementationId: 'haskell-shelley',
  networkId: 300,
  checksum: {TextPart: 'text-part', ImagePart: 'image-part'},
  isHW: false,
  isReadOnly: false,
  isEasyConfirmationEnabled: false,
  fetchPoolInfo: () => {
    throw new Error('Not implemented')
  },
  changePassword: () => {
    throw new Error('Not implemented')
  },
}

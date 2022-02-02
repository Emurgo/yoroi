/* eslint-disable @typescript-eslint/no-explicit-any */
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {RemotePoolMetaSuccess} from '../../legacy/selectors'
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

const stakePoolId = 'af22f95915a19cd57adb14c558dcc4a175f60c6193dc23b8bd2d8beb'
const poolInfoAndHistory: RemotePoolMetaSuccess = {
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
  getDelegationStatus: () => {
    throw new Error('Not implemented')
  },
  subscribe: () => {
    throw new Error('Not implemented')
  },
  subscribeOnTxHistoryUpdate: () => {
    null
  },
  fetchAccountState: () =>
    Promise.resolve({
      ['reward-address-hex']: {
        remainingAmount: '0',
        rewards: '0',
        withdrawals: '',
      },
    }),
  fetchUTXOs: () => Promise.resolve([]),
  getAllUtxosForKey: () => Promise.resolve([]),
  rewardAddressHex: 'reward-address-hex',
}

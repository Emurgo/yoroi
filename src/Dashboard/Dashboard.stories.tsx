/* eslint-disable @typescript-eslint/no-explicit-any */
import {storiesOf} from '@storybook/react-native'
import {BigNumber} from 'bignumber.js'
import React from 'react'

import {RemotePoolMetaSuccess} from '../../legacy/selectors'
import {SelectedWalletProvider} from '../SelectedWallet'
import {WalletInterface} from '../types'
import {Dashboard} from './Dashboard'

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
        payloadKind: 'PoolRegistration',
        payloadKindId: 2,
        payloadHex:
          '0000000000000000000000000000000000000000000000000000000000000001c25187699ae107c9527bc7300d23eb39e3093eb8c85086244caed2d7f3baac5a11becc4a3de489336cbf3da0253e6da176f5bf6294fd8ba6e33a744d084dfbab016eab602ca57a3c92a8d2074170ba2aed43b30f9f14f9074def24330e30bc874d00000000000bd86110000000000000000e00000000000000640004c01b50ace23f00',
      },
    },
  ],
}

const wallet = {
  walletImplementationId: 'haskell-shelley',
} as WalletInterface

const availableFunds = new BigNumber(1000000)
const totalRewards = new BigNumber(123123)
const totalDelegated = availableFunds.plus(totalRewards)

storiesOf('Dashboard', module)
  .add('Default', ({navigation}: any) => (
    <SelectedWalletProvider wallet={wallet}>
      <Dashboard
        navigation={navigation}
        poolInfo={poolInfo}
        utxoBalance={availableFunds}
        accountBalance={totalRewards}
        totalDelegated={totalDelegated}
      />
    </SelectedWalletProvider>
  ))
  .add('Loading', ({navigation}: any) => (
    <SelectedWalletProvider wallet={wallet}>
      <Dashboard
        navigation={navigation}
        poolInfo={null}
        poolOperator={'poolOperator'}
        // UserSummary
        utxoBalance={availableFunds}
        accountBalance={totalRewards}
        totalDelegated={totalDelegated}
        isDelegating
      />
    </SelectedWalletProvider>
  ))
  .add('Loaded', ({navigation}: any) => (
    <SelectedWalletProvider wallet={wallet}>
      <Dashboard
        navigation={navigation}
        poolInfo={poolInfo}
        poolOperator={'poolOperator'}
        // UserSummary
        utxoBalance={availableFunds}
        accountBalance={totalRewards}
        totalDelegated={totalDelegated}
        isDelegating
      />
    </SelectedWalletProvider>
  ))

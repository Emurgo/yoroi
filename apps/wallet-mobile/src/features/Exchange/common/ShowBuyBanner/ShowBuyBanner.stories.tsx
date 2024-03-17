import {storiesOf} from '@storybook/react-native'
import {exchangeDefaultState, ExchangeProvider, successManagerMock} from '@yoroi/exchange'
import {produce} from 'immer'
import mockdate from 'mockdate'
import * as React from 'react'
import {Text} from 'react-native'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {ShowBuyBanner} from './ShowBuyBanner'

const thirtyOneDaysInMs = 31 * 24 * 60 * 60 * 1000

storiesOf('Exchange ShowBuyBanner', module) //
  // pt balance bigger than threshold PT should not display any banner
  .add('5>, no banner', () => <WithoutBanner />)

  // more than 0 and less than big threshold PT
  // if visualized in last threshold days, hide the small banner
  .add('0>5<, 30d< show small', () => {
    mockdate.reset()
    return <WithSmallBanner text="not" />
  })
  // if visualized out threshold days, show the small banner
  .add('0>5<, 30d> no banner', () => {
    mockdate.set(new Date().getTime() + thirtyOneDaysInMs)
    return <WithSmallBanner text="be" />
  })

  // 0 PT in balance show the big banner
  .add('0, big banner', () => <WithBigBanner />)

const WithoutBanner = () => {
  return (
    <SelectedWalletProvider wallet={overThreshold}>
      <ExchangeProvider manager={successManagerMock} initialState={{...exchangeDefaultState, providerId: 'banxa'}}>
        <Text>The only thing you should be seeing is this text</Text>

        <ShowBuyBanner />
      </ExchangeProvider>
    </SelectedWalletProvider>
  )
}
const WithSmallBanner = ({text}: {text: string}) => {
  return (
    <SelectedWalletProvider wallet={smallBanner}>
      <ExchangeProvider manager={successManagerMock} initialState={{...exchangeDefaultState, providerId: 'banxa'}}>
        <Text>You should {text} seeing a banner (small)</Text>

        <ShowBuyBanner />
      </ExchangeProvider>
    </SelectedWalletProvider>
  )
}
const WithBigBanner = () => {
  return (
    <SelectedWalletProvider wallet={bigBanner}>
      <ExchangeProvider manager={successManagerMock} initialState={{...exchangeDefaultState, providerId: 'banxa'}}>
        <Text>You should be seeing a banner (big)</Text>

        <ShowBuyBanner />
      </ExchangeProvider>
    </SelectedWalletProvider>
  )
}

const overThreshold = produce(walletMocks.wallet, (draft) => {
  draft.utxos = [
    {
      utxo_id: '56512a763500c2460844d816cb8a096f2a0a8dbf146b9f3ef6ae206d1287443b:2',
      tx_hash: '56512a763500c2460844d816cb8a096f2a0a8dbf146b9f3ef6ae206d1287443b',
      tx_index: 2,
      receiver:
        'addr_test1qz0nas9ysf55qzg402p8q7s86cjhtxjmxk2elha70dzyfuwr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qntq0jl',
      amount: '10000000',
      assets: [],
    },
  ]
})

const smallBanner = produce(walletMocks.wallet, (draft) => {
  draft.utxos = [
    {
      utxo_id: '56512a763500c2460844d816cb8a096f2a0a8dbf146b9f3ef6ae206d1287443b:2',
      tx_hash: '56512a763500c2460844d816cb8a096f2a0a8dbf146b9f3ef6ae206d1287443b',
      tx_index: 2,
      receiver:
        'addr_test1qz0nas9ysf55qzg402p8q7s86cjhtxjmxk2elha70dzyfuwr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qntq0jl',
      amount: '4999999',
      assets: [],
    },
  ]
})

const bigBanner = produce(walletMocks.wallet, (draft) => {
  draft.utxos = [
    {
      utxo_id: '56512a763500c2460844d816cb8a096f2a0a8dbf146b9f3ef6ae206d1287443b:2',
      tx_hash: '56512a763500c2460844d816cb8a096f2a0a8dbf146b9f3ef6ae206d1287443b',
      tx_index: 2,
      receiver:
        'addr_test1qz0nas9ysf55qzg402p8q7s86cjhtxjmxk2elha70dzyfuwr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qntq0jl',
      amount: '0',
      assets: [],
    },
  ]
})

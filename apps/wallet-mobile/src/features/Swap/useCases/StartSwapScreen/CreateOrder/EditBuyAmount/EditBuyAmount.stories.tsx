import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, SwapProvider} from '@yoroi/swap'
import {produce} from 'immer'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {SearchProvider} from '../../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../../SelectedWallet'
import {mocks} from '../../../../../../yoroi-wallets/mocks/wallet'
import {EditBuyAmount} from './EditBuyAmount'

const mockWallet = produce(mocks.wallet, (draft) => {
  draft.utxos = [
    {
      utxo_id: '1d38bea2d83eec5cca60ca2c1c3cc0db48b8e2e1a632c2d97849adb5357aca05:1',
      tx_hash: '1d38bea2d83eec5cca60ca2c1c3cc0db48b8e2e1a632c2d97849adb5357aca05',
      tx_index: 1,
      receiver:
        'addr_test1qz54nn8wkn4zppe3js5ta9d4t09nyfmjyx2lh5g37tu6dcwr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0q3pj8n4',
      amount: '2000000',
      assets: [
        {
          assetId: '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f.444444',
          policyId: '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f',
          name: '444444',
          amount: '44',
        },
        {
          assetId: '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f.',
          policyId: '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f',
          name: '',
          amount: '1000',
        },
        {
          assetId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c53',
          policyId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e',
          name: '74484f444c53',
          amount: '1234567800000000',
        },
        {
          assetId: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443',
          policyId: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198',
          name: '7755534443',
          amount: '12345',
        },
      ],
    },
  ]
})
const mockSwapStateOtherToken = produce(mockSwapStateDefault, (draft) => {
  draft.createOrder.amounts = {
    sell: {
      tokenId: '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f.444444',
      quantity: '500000',
    },
    buy: {
      tokenId: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443',
      quantity: '5000000',
    },
  }
})
const mockSwapStateSameToken = produce(mockSwapStateDefault, (draft) => {
  draft.createOrder.amounts = {
    sell: {
      tokenId: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443',
      quantity: '500000',
    },
    buy: {
      tokenId: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443',
      quantity: '400000',
    },
  }
})
const mockSwapStateUnamedToken = produce(mockSwapStateDefault, (draft) => {
  draft.createOrder.amounts.sell.tokenId = '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f.'
})
const mockSwapStateWithIconBigDecimals = produce(mockSwapStateDefault, (draft) => {
  draft.createOrder.amounts.buy = {
    tokenId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c53',
    quantity: '12301234567',
  }
})

storiesOf('Swap Edit Buy Amount', module)
  .add('initial - message', () => {
    return (
      <SelectedWalletProvider wallet={mocks.wallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager}>
            <View style={styles.container}>
              <EditBuyAmount />
            </View>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
  .add('other token', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager} initialState={mockSwapStateOtherToken}>
            <View style={styles.container}>
              <EditBuyAmount />
            </View>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
  .add('same token', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager} initialState={mockSwapStateSameToken}>
            <View style={styles.container}>
              <EditBuyAmount />
            </View>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
  .add('unamed token', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager} initialState={mockSwapStateUnamedToken}>
            <View style={styles.container}>
              <EditBuyAmount />
            </View>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
  .add('icon + big decimals', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager} initialState={mockSwapStateWithIconBigDecimals}>
            <View style={styles.container}>
              <EditBuyAmount />
            </View>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

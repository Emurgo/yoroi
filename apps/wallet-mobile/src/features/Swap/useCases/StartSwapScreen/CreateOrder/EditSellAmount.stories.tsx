import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, SwapProvider} from '@yoroi/swap'
import {produce} from 'immer'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {SearchProvider} from '../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {EditSellAmount} from './EditSellAmount'

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
      ],
    },
  ]
})
const mockSwapStateNoBalance = produce(mockSwapStateDefault, (draft) => {
  draft.createOrder.amounts.sell.quantity = '3000000'
})
const mockSwapStateSecodarySell = produce(mockSwapStateDefault, (draft) => {
  draft.createOrder.amounts.sell.tokenId = '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f.444444'
})
const mockSwapStateUnamedSell = produce(mockSwapStateDefault, (draft) => {
  draft.createOrder.amounts.sell.tokenId = '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f.'
})

const EditSellAmountWrapper = () => {
  const [inputSellValue, setInputSellValue] = React.useState<string>('')
  return <EditSellAmount inputValue={inputSellValue} setInputValue={setInputSellValue} />
}

storiesOf('Swap Edit Sell Amount', module)
  .add('initial primary token', () => {
    return (
      <SelectedWalletProvider wallet={mocks.wallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager}>
            <View style={styles.container}>
              <EditSellAmountWrapper />
            </View>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
  .add('with balance', () => {
    return (
      <SelectedWalletProvider wallet={mocks.wallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager}>
            <View style={styles.container}>
              <EditSellAmountWrapper />
            </View>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
  .add('without balance', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager} initialState={mockSwapStateNoBalance}>
            <View style={styles.container}>
              <EditSellAmountWrapper />
            </View>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
  .add('secondary token', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager} initialState={mockSwapStateSecodarySell}>
            <View style={styles.container}>
              <EditSellAmountWrapper />
            </View>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
  .add('secondary unamed token', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager} initialState={mockSwapStateUnamedSell}>
            <View style={styles.container}>
              <EditSellAmountWrapper />
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

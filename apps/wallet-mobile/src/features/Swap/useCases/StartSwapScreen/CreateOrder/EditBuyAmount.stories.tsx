import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {SearchProvider} from '../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {EditBuyAmount} from './EditBuyAmount'

const EditBuyAmountWrapper = () => {
  const [inputBuyValue, setInputBuylValue] = React.useState<string>('')
  return <EditBuyAmount inputValue={inputBuyValue} setInputValue={setInputBuylValue} />
}

storiesOf('Swap Edit Buy Amount', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SearchProvider>
        <SwapProvider swapManager={mockSwapManager}>
          <View style={styles.container}>
            <EditBuyAmountWrapper />
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

import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {SearchProvider} from '../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks'
import {ExchangeProvider} from '../../../common/ExchangeProvider'
import {mockExchangeStateDefault, mockExchangeStateWithNotEnoughError} from '../../../common/mocks'
import {EditAmount} from './EditAmount'

storiesOf('Exchange Edit Amount', module)
  .add('initial - message', () => {
    return (
      <SelectedWalletProvider wallet={mocks.wallet}>
        <SearchProvider>
          <ExchangeProvider initialState={mockExchangeStateDefault}>
            <View style={styles.container}>
              <EditAmount />
            </View>
          </ExchangeProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
  .add('not enough balance', () => {
    return (
      <SelectedWalletProvider wallet={mocks.wallet}>
        <SearchProvider>
          <ExchangeProvider initialState={mockExchangeStateWithNotEnoughError}>
            <View style={styles.container}>
              <EditAmount />
            </View>
          </ExchangeProvider>
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

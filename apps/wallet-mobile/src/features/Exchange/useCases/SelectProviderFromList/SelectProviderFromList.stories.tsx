import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks} from '../../../../yoroi-wallets/mocks'
import {ExchangeProvider} from '../../common/ExchangeProvider'
import {mockExchangeStateDefault} from '../../common/mocks'
import {SelectProviderFromList} from './SelectProviderFromList'

storiesOf('Exchange SelectProvidert', module).add('Default', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <ExchangeProvider initialState={mockExchangeStateDefault}>
        <View style={styles.container}>
          <SelectProviderFromList />
        </View>
      </ExchangeProvider>
    </SelectedWalletProvider>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

import {storiesOf} from '@storybook/react-native'
import {exchangeDefaultState, ExchangeProvider, successManagerMock} from '@yoroi/exchange'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks} from '../../../../yoroi-wallets/mocks'
import {SelectProviderFromListScreen} from './SelectProviderFromListScreen'

storiesOf('Exchange SelectProviderFromListScreen', module).add('Default', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <ExchangeProvider manager={successManagerMock} initialState={{...exchangeDefaultState, providerId: 'banxa'}}>
        <View style={styles.container}>
          <SelectProviderFromListScreen />
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

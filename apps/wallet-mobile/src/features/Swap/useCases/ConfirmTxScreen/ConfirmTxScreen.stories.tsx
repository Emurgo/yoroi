import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks} from '../../../../yoroi-wallets/mocks'
import {ConfirmTxScreen} from './ConfirmTxScreen'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
storiesOf('Swap ConfirmTxScreen', module)
  .addDecorator((story) => (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <View style={styles.container}>{story()}</View>
    </SelectedWalletProvider>
  ))
  .add('Default', () => <ConfirmTxScreen />)

import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {SelectedWalletProvider} from '../SelectedWallet'
import {WalletInterface} from '../types'
import {WalletSettingsScreen} from './WalletSettingsScreen'

const styles = StyleSheet.create({
  walletSettingsScreen: {
    flex: 1,
  },
})

const wallet = {
  walletImplementationId: 'haskell-shelley',
  networkId: 1,
} as WalletInterface

storiesOf('WalletSettingsScreen', module)
  .addDecorator((getStory) => <View style={styles.walletSettingsScreen}>{getStory()}</View>)
  .add('Default', () => (
    <SelectedWalletProvider wallet={wallet}>
      <WalletSettingsScreen />
    </SelectedWalletProvider>
  ))

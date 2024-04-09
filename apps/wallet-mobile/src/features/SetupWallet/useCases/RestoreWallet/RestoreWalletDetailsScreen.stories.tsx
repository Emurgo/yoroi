import {storiesOf} from '@storybook/react-native'
import {SetupWalletProvider} from '@yoroi/setup-wallet'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {RestoreWalletDetailsScreen} from './RestoreWalletDetailsScreen'

storiesOf('AddWallet RestoreWallet RestoreWalletDetailsScreen', module)
  .addDecorator((story) => (
    <SetupWalletProvider
      initialState={{
        networkId: 1,
        publicKeyHex:
          '1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf',
      }}
    >
      <View style={styles.container}>{story()}</View>
    </SetupWalletProvider>
  ))
  .add('initial', () => <RestoreWalletDetailsScreen />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

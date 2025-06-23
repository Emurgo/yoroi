import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {WalletDetailsScreen} from './WalletDetailsScreen'

storiesOf('AddWallet CreateWallet WalletDetailsScreen', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <WalletDetailsScreen />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {RestoreWalletDetailsScreen} from './RestoreWalletDetailsScreen'

storiesOf('AddWallet RestoreWallet RestoreWalletDetailsScreen', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <RestoreWalletDetailsScreen />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

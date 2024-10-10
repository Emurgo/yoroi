import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {PreparingWalletScreen} from './PreparingWalletScreen'

storiesOf('AddWallet PreparingWallet', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <PreparingWalletScreen />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

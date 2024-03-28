import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {NewWalletNighltyScreen} from './NewWalletNighltyScreen'

storiesOf('AddWallet NewWalletNighltyScreen', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <NewWalletNighltyScreen />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {WalletAddress} from './WalletAddress'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
})

storiesOf('WalletAddress', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('Default', () => <WalletAddress networkId={1} addressHash="addressHash" />)

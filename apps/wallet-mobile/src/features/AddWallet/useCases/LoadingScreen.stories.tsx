import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {LoadingScreen} from './LoadingScreen'

storiesOf('AddWallet LoadingScreen', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <LoadingScreen title="Preparing your wallet..." />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

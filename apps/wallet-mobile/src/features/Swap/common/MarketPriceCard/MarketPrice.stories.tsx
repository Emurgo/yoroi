import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {MarketPrice} from './index'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('Market Price Input', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('inital', () => <MarketPrice />)

storiesOf('Market Price Input', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('disabled', () => <MarketPrice disabled />)

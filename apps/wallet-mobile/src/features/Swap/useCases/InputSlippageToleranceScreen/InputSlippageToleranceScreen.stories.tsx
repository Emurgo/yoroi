import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {InputSlippageToleranceScreen} from './InputSlippageToleranceScreen'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('SWAP Slippage Tolerance Screen', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('inital', () => <InputSlippageToleranceScreen />)

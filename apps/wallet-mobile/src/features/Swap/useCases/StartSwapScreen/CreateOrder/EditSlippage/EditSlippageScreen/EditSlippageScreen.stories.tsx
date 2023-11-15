import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {EditSlippageScreen} from './EditSlippageScreen'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('Swap Edit Slippage Screen', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('inital', () => <EditSlippageScreen />)

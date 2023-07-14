import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet} from 'react-native'
import {View} from 'react-native'

import {SwapCard} from './SwapCard'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('Swap Card', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with label', () => <SwapCard label="Swap from" />)

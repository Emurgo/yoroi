import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ClearQuantities} from './ClearQuantities'

storiesOf('Swap Clear Quantities', module).add('only enabled', () => {
  return (
    <View style={styles.container}>
      <ClearQuantities />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

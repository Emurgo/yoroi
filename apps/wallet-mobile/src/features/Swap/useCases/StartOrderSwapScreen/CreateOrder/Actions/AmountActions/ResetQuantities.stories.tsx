import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ResetQuantities} from './ResetQuantities'

storiesOf('Swap Reset Quantities', module).add('only enabled', () => {
  return (
    <View style={styles.container}>
      <ResetQuantities />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

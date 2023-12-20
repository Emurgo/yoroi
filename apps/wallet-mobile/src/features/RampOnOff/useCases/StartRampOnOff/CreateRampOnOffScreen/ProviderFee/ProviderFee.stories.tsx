import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import ProviderFee from './ProviderFee'

storiesOf('ProviderFee For rampOnOff', module).add('Default', () => (
  <View style={styles.container}>
    <ProviderFee />
  </View>
))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

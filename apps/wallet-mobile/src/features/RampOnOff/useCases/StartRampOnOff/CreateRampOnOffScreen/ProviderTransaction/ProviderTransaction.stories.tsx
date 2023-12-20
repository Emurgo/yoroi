import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import ProviderTransaction from './ProviderTransaction'

storiesOf('ProviderTransaction For rampOnOff', module).add('Default', () => (
  <View style={styles.container}>
    <ProviderTransaction />
  </View>
))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

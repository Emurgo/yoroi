import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import Disclaimer from './Disclaimer'

storiesOf('Disclaimer For rampOnOff', module).add('Default', () => (
  <View style={styles.container}>
    <Disclaimer />
  </View>
))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

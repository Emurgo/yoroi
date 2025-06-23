import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {LogoBanner} from './LogoBanner'

storiesOf('AddWallet LogoBanner', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <LogoBanner />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

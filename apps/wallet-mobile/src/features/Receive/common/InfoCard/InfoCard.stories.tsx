import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {InfoCard} from './InfoCard'

storiesOf('Receive InfoCardLimitAddresses', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('default', () => <InfoCard onLimit />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

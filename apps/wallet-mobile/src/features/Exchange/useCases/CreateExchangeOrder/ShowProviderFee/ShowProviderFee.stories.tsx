import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ShowProviderFee} from './ShowProviderFee'

storiesOf('Exchange ShowProviderFee', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <ShowProviderFee />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../mocks'
import {CaptureShareQRCodeCard} from './CaptureShareQRCodeCard'

storiesOf('Receive CaptureShareQRCodeCard', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('default', () => <CaptureShareQRCodeCard address={mocks.address} />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

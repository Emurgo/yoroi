import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../mocks'
import {ShareQRCodeCard} from './ShareQRCodeCard'

storiesOf('Receive ShareQRCodeCard', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('default', () => <ShareQRCodeCard address={mocks.address} />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

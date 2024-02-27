import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../mocks'
import {ShareQRCodeCard} from './ShareQRCodeCard'

storiesOf('Receive ShareQRCodeCard', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with content', () => (
    <ShareQRCodeCard content={mocks.address} onLongPress={action('onLongPress')} title="Title" />
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

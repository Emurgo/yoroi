import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../mocks'
import {ReceiveProvider} from '../ReceiveProvider'
import {AddressDetailCard} from './AddressDetailCard'

storiesOf('Receive AddressDetailCard', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('default', () => (
    <ReceiveProvider>
      <AddressDetailCard address={mocks.address} title="Test Title" />
    </ReceiveProvider>
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

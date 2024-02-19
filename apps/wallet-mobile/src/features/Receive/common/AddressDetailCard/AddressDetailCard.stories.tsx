import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../mocks'
import {AddressDetailCard} from './AddressDetailCard'

storiesOf('Receive AddressDetailCard', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('default', () => (
    <AddressDetailCard
      address={mocks.address}
      title="Test Title"
      addressDetails={{
        spendingHash: mocks.spendinghash,
        stakingHash: mocks.stakinghash,
      }}
    />
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

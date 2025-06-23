import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../mocks'
import {SmallAddressCard} from './SmallAddressCard'

storiesOf('Receive SmallAddressCard', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('used', () => <SmallAddressCard address={mocks.address} isUsed date={mocks.usedAddressDate} />)
  .add('unused', () => <SmallAddressCard address={mocks.address} isUsed={false} />)
  .add('loading', () => <SmallAddressCard address={mocks.address} loading />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

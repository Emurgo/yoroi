import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../mocks'
import {ShareDetailsCard} from './ShareDetailsCard'

storiesOf('Receive ShareDetailsCard', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('default', () => (
    <ShareDetailsCard
      address={mocks.address}
      spendingHash={mocks.spendinghash}
      stakingHash={mocks.stakinghash}
      title="Test Title"
    />
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

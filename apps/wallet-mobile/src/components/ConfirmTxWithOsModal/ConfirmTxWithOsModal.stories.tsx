import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../../yoroi-wallets/mocks'
import {ConfirmTxWithOsModal} from './ConfirmTxWithOsModal'

storiesOf('ConfirmTxWithOsModal', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('Default', () => <ConfirmTxWithOsModal unsignedTx={mocks.yoroiUnsignedTx} />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../../yoroi-wallets/mocks'
import {ConfirmTxWithSpendingPasswordModal} from './ConfirmTxWithSpendingPasswordModal'

storiesOf('ConfirmTxWithSpendingPasswordModal', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('Default', () => <ConfirmTxWithSpendingPasswordModal unsignedTx={mocks.yoroiUnsignedTx} />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

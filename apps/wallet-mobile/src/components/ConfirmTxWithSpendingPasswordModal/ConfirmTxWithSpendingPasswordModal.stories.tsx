import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../../yoroi-wallets/mocks'
import {ConfirmTxWithSpendingPasswordModal} from './ConfirmTxWithSpendingPasswordModal'

const strings = {
  enterSpendingPassword: 'Enter spending password',
  spendingPassword: 'Spending password',
  sign: 'Sign',
  wrongPasswordMessage: 'Wrong password. Please try again.',
  error: 'Error',
}

storiesOf('ConfirmTxWithSpendingPasswordModal', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('Default', () => <ConfirmTxWithSpendingPasswordModal strings={strings} unsignedTx={mocks.yoroiUnsignedTx} />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

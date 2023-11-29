import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ConfirmWithSpendingPasswordModal} from './ConfirmWithSpendingPasswordModal'

const strings = {
  enterSpendingPassword: 'Enter spending password',
  spendingPassword: 'Spending password',
  sign: 'Sign',
  wrongPasswordMessage: 'Wrong password. Please try again.',
  error: 'Error',
}

storiesOf('ConfirmWithSpendingPassword', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('Initial', () => <ConfirmWithSpendingPasswordModal strings={strings} />)
  .add('Loading', () => <ConfirmWithSpendingPasswordModal strings={strings} isLoading />)
  .add('Error', () => <ConfirmWithSpendingPasswordModal strings={strings} error={new Error('Example error')} />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

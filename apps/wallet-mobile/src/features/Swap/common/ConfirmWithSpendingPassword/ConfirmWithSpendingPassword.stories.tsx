import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ConfirmWithSpendingPassword} from './ConfirmWithSpendingPassword'

storiesOf('ConfirmWithSpendingPassword', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('Initial', () => <ConfirmWithSpendingPassword />)
  .add('Loading', () => <ConfirmWithSpendingPassword isLoading />)
  .add('Error', () => <ConfirmWithSpendingPassword error={new Error('Example error')} />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

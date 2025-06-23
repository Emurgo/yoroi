import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ChooseBiometricLoginScreen} from './ChooseBiometricLoginScreen'

storiesOf('AddWallet ChooseBiometricLoginScreen', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <ChooseBiometricLoginScreen />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

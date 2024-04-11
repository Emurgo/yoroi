import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {VerifyRecoveryPhraseScreen} from './VerifyRecoveryPhraseScreen'

storiesOf('AddWallet CreateWallet VerifyRecoveryPhraseScreen', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <VerifyRecoveryPhraseScreen />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

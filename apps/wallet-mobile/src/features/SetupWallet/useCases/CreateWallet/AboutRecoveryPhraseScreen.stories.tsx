import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {AboutRecoveryPhraseScreen} from './AboutRecoveryPhraseScreen'

storiesOf('AddWallet CreateWallet AboutRecoveryPhraseScreen', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <AboutRecoveryPhraseScreen />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

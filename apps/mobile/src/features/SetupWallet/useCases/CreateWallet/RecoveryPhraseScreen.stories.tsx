import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {RecoveryPhraseScreen} from './RecoveryPhraseScreen'

storiesOf('AddWallet CreateWallet RecoveryPhraseScreen', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <RecoveryPhraseScreen />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

// @flow

import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import WalletSettingsScreen from './WalletSettingsScreen'

const styles = StyleSheet.create({
  walletSettingsScreen: {
    flex: 1,
  },
})

storiesOf('WalletSettingsScreen', module)
  .addDecorator((getStory) => <View style={styles.walletSettingsScreen}>{getStory()}</View>)
  .add('Default', () => <WalletSettingsScreen />)

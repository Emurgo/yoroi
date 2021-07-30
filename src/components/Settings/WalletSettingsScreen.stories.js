// @flow

import React from 'react'
import {StyleSheet, View} from 'react-native'

import {storiesOf} from '@storybook/react-native'

import WalletSettingsScreen from './WalletSettingsScreen'
import {withNavigationProps} from '../../../storybook'

const styles = StyleSheet.create({
  walletSettingsScreen: {
    flex: 1,
  },
})

storiesOf('WalletSettingsScreen', module)
  .addDecorator((getStory) => <View style={styles.walletSettingsScreen}>{getStory()}</View>)
  .addDecorator(withNavigationProps)
  .add('Default', ({navigation, route}) => <WalletSettingsScreen navigation={navigation} route={route} />)

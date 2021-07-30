// @flow

import React from 'react'
import {StyleSheet, View} from 'react-native'

import {storiesOf} from '@storybook/react-native'

import ApplicationSettingsScreen from './ApplicationSettingsScreen'
import {withNavigationProps} from '../../../storybook'

const styles = StyleSheet.create({
  applicationSettingsScreen: {
    flex: 1,
  },
})

storiesOf('ApplicationSettingsScreen', module)
  .addDecorator((getStory) => <View style={styles.applicationSettingsScreen}>{getStory()}</View>)
  .addDecorator(withNavigationProps)
  .add('Default', ({navigation, route}) => <ApplicationSettingsScreen navigation={navigation} route={route} />)

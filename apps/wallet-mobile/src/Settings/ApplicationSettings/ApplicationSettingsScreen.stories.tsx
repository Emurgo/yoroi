import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ApplicationSettingsScreen} from './ApplicationSettingsScreen'

const styles = StyleSheet.create({
  applicationSettingsScreen: {
    flex: 1,
  },
})

storiesOf('ApplicationSettingsScreen', module)
  .addDecorator((getStory) => <View style={styles.applicationSettingsScreen}>{getStory()}</View>)
  .add('Default', () => <ApplicationSettingsScreen />)

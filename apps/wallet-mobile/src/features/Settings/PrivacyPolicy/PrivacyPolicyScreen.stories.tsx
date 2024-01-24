import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {PrivacyPolicyScreen} from './PrivacyPolicyScreen'

const styles = StyleSheet.create({
  decorator: {
    flex: 1,
  },
})

storiesOf('PrivacyPolicyScreen', module)
  .addDecorator((getStory) => <View style={styles.decorator}>{getStory()}</View>)
  .add('Default', () => <PrivacyPolicyScreen />)

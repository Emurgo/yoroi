import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {TermsOfServiceScreen} from './TermsOfServiceScreen'

const styles = StyleSheet.create({
  termsOfServiceScreen: {
    flex: 1,
  },
})

storiesOf('TermsOfServiceScreen', module)
  .addDecorator((getStory) => <View style={styles.termsOfServiceScreen}>{getStory()}</View>)
  .add('Default', () => <TermsOfServiceScreen />)

import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {LearnMoreButton} from './LearnMoreButton'

storiesOf('AddWallet LearnMoreButton', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <LearnMoreButton />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

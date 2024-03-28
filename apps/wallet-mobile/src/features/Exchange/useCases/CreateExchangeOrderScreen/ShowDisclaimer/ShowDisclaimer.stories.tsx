import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ShowDisclaimer} from './ShowDisclaimer'

storiesOf('Exchange ShowDisclaimer', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <ShowDisclaimer />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

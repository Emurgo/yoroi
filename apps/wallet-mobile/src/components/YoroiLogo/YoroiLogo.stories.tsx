import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {YoroiLogo} from './YoroiLogo'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

storiesOf('YoroiLogo', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('Default', () => <YoroiLogo />)

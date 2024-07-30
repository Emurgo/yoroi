import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {SelectPoolFromListScreen} from './SelectPoolFromListScreen'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
storiesOf('Swap Pool Screen', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <SelectPoolFromListScreen />)

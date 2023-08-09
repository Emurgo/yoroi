import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ButtonGroup} from './ButtonGroup'

storiesOf('ButtonGroup', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with label', () => (
    <ButtonGroup buttons={['Button1', 'Button2']} onPress={(index) => action(`onPress ${index}`)} />
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

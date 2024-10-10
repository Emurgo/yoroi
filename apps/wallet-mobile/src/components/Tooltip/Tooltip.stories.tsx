import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Pressable, StyleSheet, View} from 'react-native'

import {Icon} from '../Icon'
import {Tooltip} from './Tooltip'

const styles = StyleSheet.create({
  container: {
    width: 100,
    padding: 16,
  },
})

storiesOf('Tooltip', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with title', () => (
    <Tooltip title="Tooltip title">
      <Pressable>
        <Icon.QuestionMark />
      </Pressable>
    </Tooltip>
  ))
  .add('with mode press', () => (
    <Tooltip title="Tooltip title">
      <Pressable>
        <Icon.QuestionMark />
      </Pressable>
    </Tooltip>
  ))
  .add('with mode hover', () => (
    <Tooltip mode="hover" title="Tooltip title">
      <Pressable>
        <Icon.QuestionMark />
      </Pressable>
    </Tooltip>
  ))

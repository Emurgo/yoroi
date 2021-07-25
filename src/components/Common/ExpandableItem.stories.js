// @flow

import React from 'react'
import {StyleSheet, View} from 'react-native'

import {storiesOf} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'
import {text, boolean} from '@storybook/addon-knobs'

import ExpandableItem from './ExpandableItem'

const styles = StyleSheet.create({
  ExpandableItem: {},
})

storiesOf('ExpandableItem', module)
  .addDecorator((getStory) => <View style={styles.ExpandableItem}>{getStory()}</View>)
  .add('Default', () => (
    <ExpandableItem
      content={text('Content', 'This is the content')}
      label={text('label', 'This is a label')}
      disabled={boolean('disabled', false)}
      onPress={action('onPress')}
    />
  ))

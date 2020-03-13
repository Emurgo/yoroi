// @flow

import React from 'react'
import {StyleSheet, View} from 'react-native'

import {storiesOf} from '@storybook/react-native'

import ProgressCircle from './ProgressCircle'

const styles = StyleSheet.create({
  wrapper: {
    height: 100,
    flexDirection: 'row',
    marginHorizontal: 10,
  },
})

const percentage = Math.floor(Math.random() * 100)
storiesOf('ProgressCircle', module)
  .addDecorator((getStory) => <View style={styles.wrapper}>{getStory()}</View>)
  .add('default', () => <ProgressCircle percentage={percentage} />)

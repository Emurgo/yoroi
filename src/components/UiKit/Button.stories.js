// @flow

import React from 'react'
import {StyleSheet, View} from 'react-native'

import {storiesOf} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'

import Button from './Button'

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    marginTop: 12,
    marginHorizontal: 10,
  },
})

storiesOf('Button', module)
  .addDecorator((getStory) => <View style={styles.button}>{getStory()}</View>)
  .add('with Shelley theme', () => <Button block shelleyTheme onPress={() => action('clicked')()} title="Okay" />)
  .add('with Byron theme', () => <Button block onPress={() => action('clicked')()} title="Okay" />)

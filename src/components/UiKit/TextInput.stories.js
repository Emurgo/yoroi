// @flow

import React from 'react'
import {StyleSheet, View, Platform} from 'react-native'

import {storiesOf} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'

import TextInput, {Checkmark} from './TextInput'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('TextInput', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with label', () => (
    <TextInput autoFocus label={'This is a label'} onChangeText={action()} />
  ))
  .add('secure entry', () => (
    <TextInput
      autoFocus
      secureTextEntry
      label={'secure entry'}
      keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
      onChangeText={action()}
    />
  ))
  .add('secure entry, with checkmark', () => (
    <TextInput
      autoFocus
      label={'secure entry, with checkmark'}
      right={<Checkmark />}
      secureTextEntry
      keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
      onChangeText={action()}
    />
  ))
  .add('with error', () => (
    <TextInput
      autoFocus
      label={'with error'}
      onChangeText={action()}
      errorText={'This is what an error text look like'}
    />
  ))
  .add('with error, with label', () => (
    <TextInput
      autoFocus
      label={'with error, with label'}
      onChangeText={action()}
      errorText={'error text'}
    />
  ))
  .add('numeric entry', () => (
    <TextInput
      autoFocus
      label={'numeric input'}
      keyboardType={'numeric'}
      onChangeText={action()}
    />
  ))
  .add('prefilled', () => (
    <TextInput
      autoFocus
      label={'prefilled'}
      value={'prefilled'}
      onChangeText={action()}
    />
  ))
  .add('disabled', () => (
    <TextInput
      autoFocus
      label={'disabled'}
      value={'prefilled value'}
      disabled
      onChangeText={action()}
    />
  ))
  .add('with helper text', () => (
    <TextInput
      autoFocus
      label={'with helper text'}
      onChangeText={action()}
      helperText={'This is what helper text looks like'}
    />
  ))
  .add('with helper text and error text', () => (
    <TextInput
      autoFocus
      label={'with helper text and error text'}
      onChangeText={action()}
      helperText={'This is what helper text looks like'}
      errorText={'This is what an error looks likes'}
    />
  ))

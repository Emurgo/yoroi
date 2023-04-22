import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Platform, StyleSheet, View} from 'react-native'

import {Checkmark, TextInput} from './TextInput'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('TextInput', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with label', () => (
    <TextInput autoFocus label="This is a label" onChangeText={action('onChangeText')} autoComplete={false} />
  ))
  .add('secure entry', () => (
    <TextInput
      autoFocus
      secureTextEntry
      label="secure entry"
      keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
      onChangeText={action('onChangeText')}
      autoComplete={false}
    />
  ))
  .add('secure entry, with checkmark', () => (
    <TextInput
      autoFocus
      label="secure entry, with checkmark"
      right={<Checkmark />}
      secureTextEntry
      keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
      onChangeText={action('onChangeText')}
      autoComplete={false}
    />
  ))
  .add('with error', () => (
    <TextInput
      autoFocus
      label="with error"
      onChangeText={action('onChangeText')}
      errorText="This is what an error text look like"
      autoComplete={false}
    />
  ))
  .add('with error, with label', () => (
    <TextInput
      autoFocus
      label="with error, with label"
      onChangeText={action('onChangeText')}
      errorText="error text"
      autoComplete={false}
    />
  ))
  .add('numeric entry', () => (
    <TextInput
      autoFocus
      label="numeric input"
      keyboardType="numeric"
      onChangeText={action('onChangeText')}
      autoComplete={false}
    />
  ))
  .add('prefilled', () => (
    <TextInput
      autoFocus
      label="prefilled"
      value="prefilled"
      onChangeText={action('onChangeText')}
      autoComplete={false}
    />
  ))
  .add('disabled', () => (
    <TextInput
      autoFocus
      label="disabled"
      value="prefilled value"
      disabled
      onChangeText={action('onChangeText')}
      autoComplete={false}
    />
  ))
  .add('with helper text', () => (
    <TextInput
      autoFocus
      label="with helper text"
      onChangeText={action('onChangeText')}
      helperText="This is what helper text looks like"
      autoComplete={false}
    />
  ))
  .add('with helper text and error text', () => (
    <TextInput
      autoFocus
      label="with helper text and error text"
      onChangeText={action('onChangeText')}
      helperText="This is what helper text looks like"
      errorText="This is what an error looks likes"
      autoComplete={false}
    />
  ))

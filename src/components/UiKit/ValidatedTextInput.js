// @flow

import React from 'react'
import {View, TextInput} from 'react-native'
import {withHandlers} from 'recompose'

import {Text} from '../UiKit'

import styles from './styles/ValidatedTextInput.style'

import type {ComponentType} from 'react'

const ValidatedTextInput = ({
  label,
  value,
  handleChange,
  secureTextEntry,
  error,
}) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>

    <TextInput
      secureTextEntry={secureTextEntry}
      style={styles.input}
      onChangeText={handleChange}
      value={value}
    />

    {error && <Text style={styles.error}>{error}</Text>}
  </View>
)

type ExternalProps = {|
  label: string,
  onChange: (text: string) => mixed,
  value: string,
  secureTextEntry?: boolean,
  error?: boolean,
|}

export default (withHandlers({
  handleChange: ({onChange}) => (text) => onChange(text),
})(ValidatedTextInput): ComponentType<ExternalProps>)

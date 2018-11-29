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
  keyboardType,
  style,
  ...restProps
}) => (
  <View style={styles.container}>
    <TextInput
      secureTextEntry={secureTextEntry}
      onChangeText={handleChange}
      value={value}
      keyboardType={keyboardType}
      style={[styles.input, error && styles.inputError, style]}
      {...restProps}
    />
    {!!label && (
      <View style={styles.labelWrap}>
        <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
      </View>
    )}

    {error && <Text style={styles.error}>{error}</Text>}
  </View>
)

type ExternalProps = {|
  label: string,
  onChange: (text: string) => mixed,
  value: string,
  secureTextEntry?: boolean,
  error?: boolean,
  keyboardType?: 'default' | 'numeric',
  style?: Object,
|}

export default (withHandlers({
  handleChange: ({onChange}) => (text) => onChange(text),
})(ValidatedTextInput): ComponentType<ExternalProps>)

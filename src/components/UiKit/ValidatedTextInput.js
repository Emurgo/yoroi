// @flow

import React from 'react'
import {View, TextInput} from 'react-native'

import {Text} from '../UiKit'

import styles from './styles/ValidatedTextInput.style'

type ExternalProps = {
  label: string,
  onChangeText: (text: string) => mixed,
  value: string,
  secureTextEntry?: boolean,
  error?: boolean,
  keyboardType?: 'default' | 'numeric',
  style?: Object,
}

const ValidatedTextInput = ({
  label,
  error,
  style,
  ...restProps
}: ExternalProps) => (
  <View style={styles.container}>
    <TextInput
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

export default ValidatedTextInput

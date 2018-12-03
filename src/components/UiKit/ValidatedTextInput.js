// @flow

import React from 'react'
import {View, TextInput, TouchableOpacity, Image} from 'react-native'
import {withStateHandlers} from 'recompose'

import {Text} from '../UiKit'

import styles from './styles/ValidatedTextInput.style'
import openedEyeIcon from '../../assets/img/eye-opened.png'
import closedEyeIcon from '../../assets/img/eye-closed.png'

import type {ComponentType} from 'react'

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
  secureTextEntry,
  showPassword,
  toggleShowPassword,
  ...restProps
}) => (
  <View style={styles.container}>
    <TextInput
      style={[styles.input, error && styles.inputError, style]}
      {...restProps}
      secureTextEntry={secureTextEntry && !showPassword}
      autoCorrect={!secureTextEntry}
    />
    {!!label && (
      <View style={styles.labelWrap}>
        <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
      </View>
    )}

    {secureTextEntry && (
      <TouchableOpacity
        style={styles.showPasswordContainer}
        onPress={toggleShowPassword}
      >
        <Image
          style={styles.showPassword}
          source={showPassword ? closedEyeIcon : openedEyeIcon}
        />
      </TouchableOpacity>
    )}

    {error && <Text style={styles.error}>{error}</Text>}
  </View>
)

export default (withStateHandlers(
  {showPassword: false},
  {
    toggleShowPassword: (state, props) => () => ({
      showPassword: !state.showPassword,
    }),
  },
)(ValidatedTextInput): ComponentType<ExternalProps>)

// @flow

import React from 'react'
import {View, TextInput, TouchableOpacity, Image, Platform} from 'react-native'
import {withStateHandlers} from 'recompose'

import {Text} from '../UiKit'

import styles from './styles/ValidatedTextInput.style'
import openedEyeIcon from '../../assets/img/icon/visibility-opened.png'
import closedEyeIcon from '../../assets/img/icon/visibility-closed.png'

import type {ComponentType} from 'react'

type Props = any
const ValidatedTextInput = ({
  label,
  error,
  style,
  secureTextEntry,
  showPassword,
  toggleShowPassword,
  keyboardType,
  ...restProps
}: Props) => (
  <View style={styles.container}>
    <TextInput
      {...restProps}
      style={[styles.input, error != null && error !== false && styles.inputError, style]}
      secureTextEntry={secureTextEntry === true && !showPassword}
      autoCorrect={!secureTextEntry}
      keyboardType={
        keyboardType
          ? keyboardType !== 'visible-password'
            ? keyboardType
            : Platform.OS === 'android'
            ? 'visible-password'
            : 'default' // visible-password is Android-only
          : 'default'
      }
    />
    {label != null && (
      <View style={styles.labelWrap}>
        <Text style={[styles.label, error != null && error !== false && styles.labelError]}>{label}</Text>
      </View>
    )}

    {secureTextEntry === true && (
      <TouchableOpacity style={styles.showPasswordContainer} onPress={toggleShowPassword}>
        <Image style={styles.showPassword} source={showPassword ? openedEyeIcon : closedEyeIcon} />
      </TouchableOpacity>
    )}

    {error != null && error !== false && <Text style={styles.error}>{error}</Text>}
  </View>
)

type ExternalProps = {
  label?: string,
  onChangeText: (text: string) => mixed,
  value: string,
  secureTextEntry?: boolean,
  error?: null | false | string,
  keyboardType?: 'default' | 'numeric' | 'visible-password',
  style?: Object,
  returnKeyType?: 'none' | 'done',
}

export default (withStateHandlers(
  {showPassword: false},
  {
    toggleShowPassword: (state) => () => ({
      showPassword: !state.showPassword,
    }),
  },
)(ValidatedTextInput): ComponentType<ExternalProps>)

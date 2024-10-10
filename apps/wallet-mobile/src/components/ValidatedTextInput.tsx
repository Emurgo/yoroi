import React from 'react'
import {Platform, ViewStyle} from 'react-native'

import {isEmptyString} from '../kernel/utils'
import {TextInput, TextInputProps} from './TextInput/TextInput'

type Props = TextInputProps & {
  label?: string
  onChangeText: (text: string) => void
  value: string
  secureTextEntry?: boolean
  error?: null | false | string
  keyboardType?: 'default' | 'numeric' | 'visible-password'
  style?: ViewStyle
  returnKeyType?: 'none' | 'done'
}

export const ValidatedTextInput = ({label, error, style, secureTextEntry, keyboardType, ...restProps}: Props) => {
  return (
    <TextInput
      {...restProps}
      style={style}
      label={label}
      error={error}
      secureTextEntry={secureTextEntry}
      autoCorrect={!secureTextEntry}
      keyboardType={
        !isEmptyString(keyboardType)
          ? keyboardType !== 'visible-password'
            ? keyboardType
            : Platform.OS === 'android'
            ? 'visible-password'
            : 'default' // visible-password is Android-only
          : 'default'
      }
    />
  )
}

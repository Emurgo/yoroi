import React from 'react'
import {KeyboardAvoidingView as RNKeyboardAvoidingView, KeyboardAvoidingViewProps, Platform} from 'react-native'

export const KeyboardAvoidingView = ({
  children,
  keyboardVerticalOffset,
  behavior,
  enabled,
  ...rest
}: KeyboardAvoidingViewProps) => {
  return (
    <RNKeyboardAvoidingView
      behavior={behavior ?? 'padding'}
      keyboardVerticalOffset={keyboardVerticalOffset ?? 86}
      enabled={enabled ?? Platform.OS === 'ios'}
      {...rest}
    >
      {children}
    </RNKeyboardAvoidingView>
  )
}

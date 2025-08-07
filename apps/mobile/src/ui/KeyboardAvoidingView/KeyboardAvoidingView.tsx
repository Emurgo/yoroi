import * as React from 'react'
import {
  KeyboardAvoidingViewProps,
  Platform,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
} from 'react-native'

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
      keyboardVerticalOffset={keyboardVerticalOffset ?? 70}
      enabled={enabled ?? Platform.OS === 'ios'}
      {...rest}
    >
      {children}
    </RNKeyboardAvoidingView>
  )
}

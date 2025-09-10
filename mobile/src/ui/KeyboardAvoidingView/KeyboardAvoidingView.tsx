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
  const keyboardBehavior: KeyboardAvoidingViewProps['behavior'] =
    (behavior ?? Platform.OS === 'ios')
      ? 'padding'
      : parseInt(Platform.Version.toString(), 10) >= 35
        ? 'padding'
        : 'height'

  return (
    <RNKeyboardAvoidingView
      behavior={behavior ?? keyboardBehavior}
      keyboardVerticalOffset={keyboardVerticalOffset ?? 70}
      enabled={enabled ?? Platform.OS === 'ios'}
      {...rest}
    >
      {children}
    </RNKeyboardAvoidingView>
  )
}

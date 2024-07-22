import React from 'react'
import {KeyboardAvoidingView as RNKeyboardAvoidingView, KeyboardAvoidingViewProps, Platform} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {Space} from '../Space/Space'

export const KeyboardAvoidingView = ({
  children,
  keyboardVerticalOffset,
  behavior,
  enabled,
  ...rest
}: KeyboardAvoidingViewProps) => {
  const insets = useSafeAreaInsets()
  return (
    <RNKeyboardAvoidingView
      behavior={behavior ?? 'padding'}
      keyboardVerticalOffset={keyboardVerticalOffset ?? 86 + insets.bottom}
      enabled={enabled ?? Platform.OS === 'ios'}
      {...rest}
    >
      {children}

      {Platform.OS === 'android' && !enabled && <Space height="lg" />}
    </RNKeyboardAvoidingView>
  )
}

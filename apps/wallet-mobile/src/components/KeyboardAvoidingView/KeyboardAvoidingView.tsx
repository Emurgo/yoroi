import React from 'react'
import {KeyboardAvoidingView as RNKeyboardAvoidingView, KeyboardAvoidingViewProps, Platform} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {useIsKeyboardOpen} from '../../kernel/keyboard/useIsKeyboardOpen'
import {Space} from '../Space/Space'

export const KeyboardAvoidingView = ({
  children,
  keyboardVerticalOffset,
  behavior,
  enabled,
  ...rest
}: KeyboardAvoidingViewProps) => {
  const insets = useSafeAreaInsets()
  const isKeyboardOpen = useIsKeyboardOpen()
  return (
    <RNKeyboardAvoidingView
      behavior={behavior ?? 'padding'}
      keyboardVerticalOffset={keyboardVerticalOffset ?? 86 + insets.bottom}
      enabled={enabled ?? Platform.OS === 'ios'}
      {...rest}
    >
      {children}

      {Platform.OS === 'android' && isKeyboardOpen && <Space height="lg" />}
    </RNKeyboardAvoidingView>
  )
}

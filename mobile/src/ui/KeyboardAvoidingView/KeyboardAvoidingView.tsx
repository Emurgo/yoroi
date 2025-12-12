import * as React from 'react'
import {
  KeyboardAvoidingViewProps,
  Platform,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {useIsKeyboardOpen} from '~/common/hooks/useIsKeyboardOpen'

export const KeyboardAvoidingView = ({
  children,
  keyboardVerticalOffset,
  behavior,
  ...rest
}: KeyboardAvoidingViewProps) => {
  const isKeyboardOpen = useIsKeyboardOpen()
  const keyboardBehavior: KeyboardAvoidingViewProps['behavior'] =
    (behavior ?? Platform.OS === 'ios')
      ? 'padding'
      : parseInt(Platform.Version.toString(), 10) >= 35
        ? 'padding'
        : 'height'

  const insets = useSafeAreaInsets()

  const defaultKeyboardOffset =
    Platform.OS === 'ios' ? insets.top + 20 : insets.bottom + 16

  return (
    <RNKeyboardAvoidingView
      behavior={behavior ?? keyboardBehavior}
      keyboardVerticalOffset={
        keyboardVerticalOffset != null
          ? keyboardVerticalOffset
          : defaultKeyboardOffset
      }
      enabled={isKeyboardOpen}
      {...rest}
    >
      {children}
    </RNKeyboardAvoidingView>
  )
}

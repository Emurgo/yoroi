import * as React from 'react'
import {
  KeyboardAvoidingViewProps,
  Platform,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
} from 'react-native'

import {useIsKeyboardOpen} from '~/hooks/useIsKeyboardOpen'

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

const defaultKeyboardOffset = Platform.OS === 'ios' ? 70 : 86

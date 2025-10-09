import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'
import {
  SafeAreaView,
  type SafeAreaViewProps,
} from 'react-native-safe-area-context'

import {useIsKeyboardOpen} from '~/hooks/useIsKeyboardOpen'

import {KeyboardAvoidingView} from '../KeyboardAvoidingView/KeyboardAvoidingView'
import {useScrollViewContext} from '../ScrollView/context'

export const SafeArea = ({
  children,
  style,
  keyboardVerticalOffset,
  ...rest
}: Props) => {
  const {atoms: ta} = useTheme()
  return (
    <KeyboardAvoidingView
      style={a.flex_1}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        {...rest}
        style={StyleSheet.flatten([a.flex_1, ta.bg_color_max, style])}
      >
        {children}
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const SafeAreaFooter = ({children, style, ...rest}: ViewProps) => {
  const {palette: p} = useTheme()
  const isKeyboardOpen = useIsKeyboardOpen()
  const {isScrollBarShown} = useScrollViewContext()
  const shouldShowSeparator = isScrollBarShown || isKeyboardOpen
  return (
    <View
      style={StyleSheet.flatten([
        a.pt_lg,
        a.px_lg,
        shouldShowSeparator && a.border_t,
        shouldShowSeparator && {
          borderTopColor: p.gray_200,
        },
        style,
      ])}
      {...rest}
    >
      {children}
    </View>
  )
}

SafeArea.Footer = SafeAreaFooter

type Props = SafeAreaViewProps & {
  keyboardVerticalOffset?: number
}

import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {StyleSheet, View, ViewProps, useWindowDimensions} from 'react-native'
import {
  SafeAreaView,
  type SafeAreaViewProps,
} from 'react-native-safe-area-context'

import {useIsKeyboardOpen} from '~/hooks/useIsKeyboardOpen'

import {KeyboardAvoidingView} from '../KeyboardAvoidingView/KeyboardAvoidingView'

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

const SafeAreaActions = ({
  children,
  contentHeight,
  style,
  ...rest
}: ViewProps & {contentHeight: number}) => {
  const {palette: p} = useTheme()
  const isKeyboardOpen = useIsKeyboardOpen()
  const deviceHeight = useWindowDimensions().height
  const showDivider = deviceHeight < contentHeight || isKeyboardOpen
  return (
    <View
      style={StyleSheet.flatten([
        a.pt_lg,
        a.px_lg,
        showDivider && a.border_t,
        showDivider && {
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

SafeArea.Actions = SafeAreaActions

type Props = SafeAreaViewProps & {
  keyboardVerticalOffset?: number
}

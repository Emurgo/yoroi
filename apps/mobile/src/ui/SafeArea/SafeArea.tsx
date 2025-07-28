import {useTheme} from '@yoroi/theme'
import React from 'react'
import {
  type SafeAreaViewProps,
  SafeAreaView,
} from 'react-native-safe-area-context'

export const SafeArea = ({children, ...rest}: SafeAreaViewProps) => {
  const {palette: p} = useTheme()
  return (
    <SafeAreaView
      edges={safeAreaEdges}
      {...rest}
      style={[{flex: 1}, {backgroundColor: p.bg_color_max}, rest.style]}
    >
      {children}
    </SafeAreaView>
  )
}
const safeAreaEdges = ['bottom', 'left', 'right', 'bottom'] as const

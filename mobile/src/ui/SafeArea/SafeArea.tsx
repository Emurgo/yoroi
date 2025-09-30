import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {
  SafeAreaView,
  type SafeAreaViewProps,
} from 'react-native-safe-area-context'

export const SafeArea = ({children, style, ...rest}: SafeAreaViewProps) => {
  const {atoms: ta} = useTheme()
  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right', 'bottom']}
      {...rest}
      style={[a.flex_1, ta.bg_color_max, style]}
    >
      {children}
    </SafeAreaView>
  )
}

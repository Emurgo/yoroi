import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {atoms as a} from '@yoroi/theme'

export const FullModalScreen = ({children}: {children: React.ReactNode}) => {
  const {isDark, palette: p} = useTheme()
  return (
    <SafeAreaView
      style={[
        a.flex_1,
        {
          backgroundColor: isDark ? p.gray_50 : p.white_static,
        },
      ]}
    >
      {children}
    </SafeAreaView>
  )
}

import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary} from '../../../../../ui/Boundary/Boundary'
import {ThemePickerList} from './ThemePickerList'

export const ChangeThemeScreen = () => {
  const {atoms: ta} = useTheme()

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[a.flex_1, ta.bg_color_max]}
    >
      <Boundary>
        <ThemePickerList />
      </Boundary>
    </SafeAreaView>
  )
}

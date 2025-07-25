import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {LanguagePicker} from '../../../../../ui/LanguagePicker/LanguagePicker'

export const ChangeLanguageScreen = () => {
  const {palette: p} = useTheme()
  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={{
        ...a.flex_1,
        backgroundColor: p.bg_color_max,
      }}
    >
      <LanguagePicker />
    </SafeAreaView>
  )
}

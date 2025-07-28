import {useTheme} from '@yoroi/theme'
import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {LanguagePicker} from '~/ui/LanguagePicker/LanguagePicker'

export const LanguagePickerScreen = () => {
  const {palette: p} = useTheme()
  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[{flex: 1}, {backgroundColor: p.bg_color_max}]}
    >
      <LanguagePicker />
    </SafeAreaView>
  )
}

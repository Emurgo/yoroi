import {ThemeName, atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, TouchableOpacity} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'

type Props = {
  themeName: ThemeName
  isSelected?: boolean
  onSelectTheme: (theme: ThemeName) => void
}

export const ThemeItem = ({themeName, isSelected, onSelectTheme}: Props) => {
  const {palette: p, atoms: ta} = useTheme()
  const strings = useStrings()

  const handleSelectTheme = () => {
    onSelectTheme(themeName)
  }

  return (
    <TouchableOpacity
      onPress={handleSelectTheme}
      style={[a.py_lg, a.flex_row, a.justify_between, a.align_center]}
    >
      <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
        {strings.settings.theme.translateThemeName(themeName)}
      </Text>

      {isSelected && <Icon.Check size={24} color={p.primary_600} />}
    </TouchableOpacity>
  )
}

import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, TouchableOpacity} from 'react-native'

import {LanguageCode} from '~/kernel/i18n/localization'
import {Icon} from '~/ui/Icon'

type Props = {
  nativeName: string
  code: LanguageCode
  isSelected?: boolean
  onSelectLanguage: (code: LanguageCode) => void
}

export const LanguageItem = ({
  nativeName,
  code,
  isSelected,
  onSelectLanguage,
}: Props) => {
  const {atoms: ta, palette: p} = useTheme()

  const handleSelectLanguage = () => {
    onSelectLanguage(code)
  }

  return (
    <TouchableOpacity
      style={[a.flex_row, a.align_center, a.justify_between, a.py_lg]}
      onPress={handleSelectLanguage}
      testID={`languageSelect_${code}`}
    >
      <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>{nativeName}</Text>

      {isSelected && <Icon.Check size={24} color={p.primary_600} />}
    </TouchableOpacity>
  )
}

import {atoms as a, useTheme} from '@yoroi/theme'

import {useQuery} from '@tanstack/react-query'
import * as React from 'react'
import {ActivityIndicator} from 'react-native'
import Markdown from 'react-native-marked'

import {LanguageCode} from '~/kernel/i18n/localization'

import {loadPrivacyPolicy} from './loadPrivacyPolicy'

const useLoadPrivacyPolicy = ({languageCode}: {languageCode: LanguageCode}) => {
  const query = useQuery({
    queryKey: ['privacyPolicy', languageCode],
    queryFn: () => loadPrivacyPolicy(languageCode),
  })

  return query.data
}

export const PrivacyPolicy = ({languageCode}: {languageCode: LanguageCode}) => {
  const privacyPolicy = useLoadPrivacyPolicy({languageCode})
  const {atoms: ta, basePaletteInverted, basePalette} = useTheme()
  const color = basePaletteInverted === 'light' ? 'white' : 'black'

  return privacyPolicy != null ? (
    <Markdown
      colorScheme={basePalette}
      backgroundColor={ta.bg_color_max.backgroundColor}
      value={privacyPolicy}
      styles={{
        text: {...a.body_1_lg_regular, ...ta.text_gray_max, ...a.py_sm},
        h2: {...a.body_1_lg_medium, ...ta.text_gray_max, ...a.py_sm},
        h1: {...ta.text_gray_max, ...a.heading_3_medium, ...a.py_sm},
        strong: {
          ...ta.text_gray_max,
          ...a.body_1_lg_medium,
        },
      }}
    />
  ) : (
    <ActivityIndicator size="large" color={color} />
  )
}

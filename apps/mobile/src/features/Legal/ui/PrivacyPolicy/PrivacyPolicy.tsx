import {useQuery} from '@tanstack/react-query'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ActivityIndicator, View} from 'react-native'

import Markdown from 'react-native-marked'
import {LanguageCode} from '~/kernel/i18n/localization'
import {Space} from '~/ui/Space/Space'
import {loadPrivacyPolicy} from './loadPrivacyPolicy'

const usePrivacyPolicy = ({languageCode}: {languageCode: LanguageCode}) => {
  const query = useQuery({
    queryKey: ['privacyPolicy', languageCode],
    queryFn: () => loadPrivacyPolicy(languageCode),
  })

  return query.data
}

export const PrivacyPolicy = ({languageCode}: {languageCode: LanguageCode}) => {
  const privacyPolicy = usePrivacyPolicy({languageCode})
  const {atoms: ta} = useTheme()

  return privacyPolicy != null ? (
    <View>
      <Space.Height.lg />

      <Markdown
        value={privacyPolicy}
        styles={{
          text: {...a.body_1_lg_regular, ...ta.text_gray_max, ...a.py_sm},
          h2: {...a.body_1_lg_medium, ...ta.text_gray_max, ...a.py_sm},
          h1: {...ta.text_gray_max, ...a.heading_3_medium, paddingVertical: 10},
        }}
      />
    </View>
  ) : (
    <ActivityIndicator size="large" color="black" />
  )
}

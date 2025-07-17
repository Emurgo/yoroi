import {useQuery} from '@tanstack/react-query'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {ActivityIndicator, View} from 'react-native'

import {LanguageCode} from '../../../kernel/i18n/localization'
import {YoroiMarkdown} from '../../../ui/Markdown/YoroiMarkdown'
import {Space} from '../../../ui/Space/Space'
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
  const {palette: p} = useTheme()

  return privacyPolicy != null ? (
    <View>
      <Space.Height.lg />

      <YoroiMarkdown
        contentUri={privacyPolicy}
        style={{
          text: {
            ...a.body_1_lg_regular,
            color: p.gray_max,
            paddingVertical: a.py_sm.paddingTop, // assuming py_sm has paddingTop property
          },
          h2: {
            ...a.body_1_lg_medium,
            color: p.gray_max,
            paddingVertical: a.py_sm.paddingTop,
          },
          h1: {
            color: p.gray_max,
            fontFamily: 'Rubik-Bold',
            fontSize: 20,
            lineHeight: 30,
            paddingVertical: 10,
          },
        }}
      />
    </View>
  ) : (
    <ActivityIndicator size="large" color="black" />
  )
}

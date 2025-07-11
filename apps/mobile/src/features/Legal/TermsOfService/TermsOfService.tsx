import {useQuery} from '@tanstack/react-query'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {ActivityIndicator, View} from 'react-native'
import Markdown from 'react-native-markdown-display'

import {LanguageCode} from '../../../kernel/i18n/languages'
import {Spacer} from '../../../ui/Space/Space'
import {loadTOS} from './loadTos'

const useTos = ({languageCode}: {languageCode: LanguageCode}) => {
  const query = useQuery({
    queryKey: ['tos', languageCode],
    queryFn: () => loadTOS(languageCode),
  })

  return query.data
}

export const TermsOfService = ({
  languageCode,
}: {
  languageCode: LanguageCode
}) => {
  const tos = useTos({languageCode})
  const {palette: p} = useTheme()

  return tos != null ? (
    <View>
      <Spacer height={16} />

      {/* @ts-expect-error old react */}
      <Markdown
        style={{
          body: [{}, {color: p.gray_max}, a.body_1_lg_regular, a.py_sm],
          heading2: [{}, {color: p.gray_max}, a.body_1_lg_medium, a.py_sm],
          heading1: [
            {},
            {color: p.gray_max},
            {fontFamily: 'Rubik-Bold'},
            {fontSize: 20},
            {lineHeight: 30},
            {paddingVertical: 10},
          ],
        }}
      >
        {tos}
      </Markdown>
    </View>
  ) : (
    <ActivityIndicator size="large" color="black" />
  )
}

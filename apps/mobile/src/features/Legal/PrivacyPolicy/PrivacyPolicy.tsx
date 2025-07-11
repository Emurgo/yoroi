import {useQuery} from '@tanstack/react-query'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {ActivityIndicator, StyleSheet, View} from 'react-native'
import Markdown from 'react-native-markdown-display'

import {Spacer} from '../../../ui/Space/Space'
import {LanguageCode} from '../../../kernel/i18n/languages'
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
  const {color} = useTheme()

  return privacyPolicy != null ? (
    <View>
      <Spacer height={16} />

      {/* @ts-expect-error old react */}
      <Markdown
        style={{
          body: [
            styles.body,
            {color: color.gray_max},
            a.body_1_lg_regular,
            a.py_sm,
          ],
          heading2: [
            styles.heading2,
            {color: color.gray_max},
            a.body_1_lg_medium,
            a.py_sm,
          ],
          heading1: [
            styles.heading1,
            {color: color.gray_max},
            {fontFamily: 'Rubik-Bold'},
            {fontSize: 20},
            {lineHeight: 30},
            {paddingVertical: 10},
          ],
        }}
      >
        {privacyPolicy}
      </Markdown>
    </View>
  ) : (
    <ActivityIndicator size="large" color="black" />
  )
}

const styles = StyleSheet.create({
  body: {},
  heading2: {},
  heading1: {},
})
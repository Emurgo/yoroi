import React from 'react'
import {ActivityIndicator, StyleSheet, View} from 'react-native'
import Markdown from 'react-native-markdown-display'
import {useQuery} from 'react-query'

import {Spacer} from '../../components'
import {lightPalette} from '../../theme'
import {loadPrivacyPolicy} from './loadPrivacyPolicy'
import {LanguageCode} from '../../i18n/languages'

export const usePrivacyPolicy = ({languageCode}: {languageCode: LanguageCode}) => {
  const query = useQuery({
    queryKey: ['privacyPolicy', languageCode],
    queryFn: () => loadPrivacyPolicy(languageCode),
  })

  return query.data
}

export const PrivacyPolicy = ({languageCode}: {languageCode: LanguageCode}) => {
  const privacyPolicy = usePrivacyPolicy({languageCode})

  return privacyPolicy != null ? (
    <View>
      <Spacer height={16} />

      {/* @ts-expect-error old react */}
      <Markdown markdownStyles={{...styles}}>{privacyPolicy}</Markdown>
    </View>
  ) : (
    <ActivityIndicator size="large" color="black" />
  )
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Rubik-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: lightPalette.gray['900'],
    paddingVertical: 8,
  },
  h2: {
    fontFamily: 'Rubik-Medium',
    lineHeight: 24,
    color: lightPalette.gray['900'],
    paddingVertical: 8,
  },
  h1: {
    fontFamily: 'Rubik-Medium',
    fontSize: 20,
    lineHeight: 20,
    color: lightPalette.gray['900'],
    paddingVertical: 10,
  },
})

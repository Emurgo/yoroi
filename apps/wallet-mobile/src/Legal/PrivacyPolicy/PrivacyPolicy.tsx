import React from 'react'
import {ActivityIndicator, StyleSheet, View} from 'react-native'
import Markdown from 'react-native-markdown-display'
import {useQuery} from 'react-query'

import {Spacer} from '../../components'
import {LanguageCode} from '../../i18n/languages'
import {loadPrivacyPolicy} from './loadPrivacyPolicy'

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
      <Markdown style={styles}>{privacyPolicy}</Markdown>
    </View>
  ) : (
    <ActivityIndicator size="large" color="black" />
  )
}

const styles = StyleSheet.create({
  body: {
    fontFamily: 'Rubik-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    paddingVertical: 8,
  },
  heading2: {
    fontFamily: 'Rubik-Medium',
    lineHeight: 24,
    fontSize: 16,
    color: '#000000',
    paddingVertical: 8,
  },
  heading1: {
    fontFamily: 'Rubik-Bold',
    fontSize: 20,
    lineHeight: 30,
    color: '#000000',
    paddingVertical: 10,
  },
})

import React from 'react'
import {ActivityIndicator, StyleSheet, View} from 'react-native'
import Markdown from 'react-native-markdown-display'
import {useQuery} from 'react-query'

import {Spacer} from '../../components'
import {LanguageCode} from '../../i18n/languages'
import {loadTOS} from './loadTos'

export const useTos = ({languageCode}: {languageCode: LanguageCode}) => {
  const query = useQuery({
    queryKey: ['tos', languageCode],
    queryFn: () => loadTOS(languageCode),
  })

  return query.data
}

export const TermsOfService = ({languageCode}: {languageCode: LanguageCode}) => {
  const tos = useTos({languageCode})

  return tos != null ? (
    <View>
      <Spacer height={16} />

      <Markdown style={styles}>{tos}</Markdown>
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

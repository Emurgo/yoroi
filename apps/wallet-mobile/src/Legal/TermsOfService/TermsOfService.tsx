import React from 'react'
import {ActivityIndicator, StyleSheet, View} from 'react-native'
import Markdown from 'react-native-markdown-display'
import {useQuery} from 'react-query'

import {Spacer} from '../../components'
import {lightPalette} from '../../theme'
import {loadTOS} from './loadTos'

export const useTos = ({languageCode}: {languageCode: string}) => {
  const query = useQuery({
    queryKey: ['tos', languageCode],
    queryFn: () => loadTOS(languageCode),
  })

  return query.data
}

export const TermsOfService = ({languageCode}: {languageCode: string}) => {
  const tos = useTos({languageCode})

  return tos != null ? (
    <View>
      <Spacer height={16} />

      {/* @ts-expect-error old react */}
      <Markdown markdownStyles={{...styles}}>{tos}</Markdown>
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

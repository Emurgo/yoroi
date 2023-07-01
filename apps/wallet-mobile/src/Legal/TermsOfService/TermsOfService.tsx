import React from 'react'
import {ActivityIndicator, StyleSheet, View} from 'react-native'
import Markdown from 'react-native-markdown-display'
import {useQuery} from 'react-query'

import {Spacer} from '../../components'
import {theme} from '../../theme'
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
      <Markdown style={styles}>{tos}</Markdown>
    </View>
  ) : (
    <ActivityIndicator size="large" color="black" />
  )
}

const styles = StyleSheet.create({
  paragraph: {
    ...theme.text,
  },
  heading1: {
    ...theme.text,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: 'bold',
  },
  heading2: {
    ...theme.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: 'bold',
  },
})

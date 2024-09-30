import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ActivityIndicator, StyleSheet, View} from 'react-native'
import Markdown from 'react-native-markdown-display'
import {useQuery} from '@tanstack/react-query'

import {Spacer} from '../../../components/Spacer/Spacer'
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
  const styles = useStyles()

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

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    body: {
      ...atoms.body_1_lg_regular,
      ...atoms.py_sm,
      color: color.gray_max,
    },
    heading2: {
      ...atoms.body_1_lg_medium,
      ...atoms.py_sm,
      color: color.gray_max,
    },
    heading1: {
      fontFamily: 'Rubik-Bold',
      fontSize: 20,
      lineHeight: 30,
      color: color.gray_max,
      paddingVertical: 10,
    },
  })

  return styles
}

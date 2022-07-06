import React from 'react'
import {ActivityIndicator} from 'react-native'
import Markdown from 'react-native-easy-markdown'

import {lightPalette} from '../../theme'
import {useTos} from '..'

export const TermsOfService = ({languageCode}: {languageCode: string}) => {
  const tos = useTos({languageCode})

  return tos ? (
    <Markdown
      markdownStyles={{
        text: {
          fontFamily: 'Rubik-Regular',
          fontSize: 16,
          lineHeight: 24,
          color: lightPalette.gray['900'],
          paddingVertical: 8,
        },
        h2: {fontFamily: 'Rubik-Medium', lineHeight: 24, color: lightPalette.gray['900'], paddingVertical: 8},
        h1: {
          fontFamily: 'Rubik-Medium',
          fontSize: 32,
          lineHeight: 45,
          color: lightPalette.gray['900'],
          paddingVertical: 10,
        },
      }}
    >
      {tos}
    </Markdown>
  ) : (
    <ActivityIndicator size="large" color="black" />
  )
}

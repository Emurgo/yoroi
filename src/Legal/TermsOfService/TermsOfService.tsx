import React from 'react'
import {ActivityIndicator} from 'react-native'
import Markdown from 'react-native-easy-markdown'

import {useTos} from '..'

export const TermsOfService = ({languageCode}: {languageCode: string}) => {
  const tos = useTos({languageCode})

  return tos ? <Markdown>{tos}</Markdown> : <ActivityIndicator size="large" color="black" />
}

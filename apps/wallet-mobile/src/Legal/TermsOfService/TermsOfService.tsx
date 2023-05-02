import React from 'react'
import {ActivityIndicator} from 'react-native'
import Markdown from 'react-native-markdown-display'
import {useQuery} from 'react-query'

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
  // @ts-expect-error old react
  return tos != null ? <Markdown>{tos}</Markdown> : <ActivityIndicator size="large" color="black" />
}

import React from 'react'
import {ActivityIndicator} from 'react-native'
import Markdown from 'react-native-easy-markdown'
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

  return tos != null ? <Markdown>{tos}</Markdown> : <ActivityIndicator size="large" color="black" />
}

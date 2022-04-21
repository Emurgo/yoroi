import React from 'react'
import {ActivityIndicator} from 'react-native'
import Markdown from 'react-native-easy-markdown'

import {useLanguage} from '../../../i18n'
import {loadTOS} from './loadTos'

export const TermsOfService = () => {
  const [tos, setTos] = React.useState()
  const {languageCode} = useLanguage()

  React.useEffect(() => {
    loadTOS(languageCode).then(setTos)
  }, [languageCode])

  return tos ? <Markdown>{tos}</Markdown> : <ActivityIndicator size="large" color="black" />
}

// @flow

import React from 'react'
import {ActivityIndicator} from 'react-native'
import Markdown from 'react-native-easy-markdown'
import {useSelector} from 'react-redux'

import {loadTOS} from '../../helpers/appSettings'
import {languageSelector} from '../../selectors'

const TermsOfService = () => {
  const [tos, setTos] = React.useState()
  const languageCode = useSelector(languageSelector)

  React.useEffect(() => {
    loadTOS(languageCode).then(setTos)
  }, [languageCode])

  return tos ? <Markdown>{tos}</Markdown> : <ActivityIndicator size={'large'} color={'black'} />
}

export default TermsOfService

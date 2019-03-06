// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import Markdown from 'react-native-easy-markdown'
import loadLocalResource from 'react-native-local-resource'

import EN_TOS from '../../i18n/locales/terms-of-use/ada/en-US.md'

type Props = {
  tos: any,
}

const TermsOfService = ({tos}: Props) => {
  return (
    <Markdown>
      {tos}
    </Markdown>
  )
}

export default compose(
  connect((state) => {
    return {
      tos: state.tos,
    }
  }))(TermsOfService)

// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import Markdown from 'react-native-easy-markdown'

import type {ComponentType} from 'react'

type Props = {
  tos: string,
}

const TermsOfService = ({tos}: Props) => {
  return <Markdown>{tos}</Markdown>
}

export default (compose(
  connect((state) => {
    return {
      tos: state.tos,
    }
  }),
)(TermsOfService): ComponentType<any>)

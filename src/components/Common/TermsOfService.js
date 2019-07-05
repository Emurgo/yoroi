// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import Markdown from 'react-native-easy-markdown'
import {loadTOS} from '../../helpers/appSettings'

import type {ComponentType} from 'react'

type Props = {
  languageCode: any,
}

type State = {
  tos: string,
}

class TermsOfService extends React.Component<Props, State> {

  constructor(props) {
    super(props)
    this.state = {tos: ''}
  }

  async componentDidMount() {
    const languageCode = this.props.languageCode
    const tos = await loadTOS(languageCode)
    this.setState({tos}) // eslint-disable-line react/no-did-mount-set-state
  }

  render() {
    return <Markdown>{this.state.tos}</Markdown>
  }

}

export default (compose(
  connect(
    (state) => ({
      languageCode: state.appSettings.languageCode,
    }),
  )
)(TermsOfService): ComponentType<any>)

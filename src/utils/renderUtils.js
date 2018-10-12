import React from 'react'
import {connect} from 'react-redux'

export const onDidMount = (didMount) => (BaseComponent) =>
  class OnDidMount extends React.Component {
    componentDidMount = () => {
      return didMount(this.props)
    }

    render = () => <BaseComponent {...this.props} />
  }

export const withTranslation = (getTrans) =>
  connect((state) => ({trans: getTrans(state)}))

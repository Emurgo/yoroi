import React from 'react'

export const onDidMount = (didMount) => (BaseComponent) =>
  class OnDidMount extends React.Component {
    componentDidMount = () => {
      return didMount(this.props)
    }

    render = () => <BaseComponent {...this.props} />
  }

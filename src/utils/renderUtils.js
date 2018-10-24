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

export const withNavigationTitle = (getTitle) => (BaseComponent) =>
  class WithScreenTitle extends React.Component {
    componentDidMount = () => {
      this.props.navigation.setParams({title: getTitle(this.props)})
    }

    componentDidUpdate = () => {
      // Note(ppershing): At this place we would normally check
      // shallowCompare(this.props, prevProps) and only rerender
      // if some prop changed.
      // Unfortunately, setting navigation.setParams will update props
      // and so we get into an infinity loop.
      // The solution is to *assume* getTitle to be deterministic
      // and diff on title instead
      const current = this.props.navigation.getParam('title')
      const updated = getTitle(this.props)

      if (current !== updated) {
        this.props.navigation.setParams({title: updated})
      }
    }

    render = () => <BaseComponent {...this.props} />
  }

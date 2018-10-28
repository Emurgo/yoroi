// @flow

import React from 'react'
import {connect} from 'react-redux'

import type {State} from '../state'

import type {ComponentType} from 'react'
import type {HOC} from 'recompose'

/* global $Exact */

// TODO(ppershing): figure out how to constrain 'any' here.
// Note that simply replacing 'any' with Props (or Subprops)
// turns flow into I-ignore-type-errors beast :-(
// prettier-ignore
export const onDidMount = <
  Props,
  Callback: (any) => mixed,
>(
    didMount: Callback,
  ): HOC<Props, Props> => (
    BaseComponent: ComponentType<Props>,
  ): ComponentType<Props> =>
    class OnDidMount extends React.Component<Props> {
      componentDidMount = () => {
        didMount(this.props)
      }

      render = () => {
        return <BaseComponent {...this.props} />
      }
    }

// prettier-ignore
export const withTranslations = <GetTrans: (State) => mixed, Props: {}>(
  getTrans: GetTrans,
): HOC<{|...$Exact<Props>, translations: $Call<GetTrans, State>|}, Props> =>
    connect((state) => ({translations: getTrans(state)}))

// prettier-ignore
export const withNavigationTitle = <Props: {navigation: any}>(
  getTitle: (Props) => string,
):HOC<Props, Props> => (BaseComponent) =>
    class WithScreenTitle extends React.Component<Props> {
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

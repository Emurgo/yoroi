// @flow
// $FlowFixMe unstable_Profiler is missing fron react annotation
import React, {unstable_Profiler as Profiler} from 'react'
import {connect} from 'react-redux'
import {Text} from 'react-native'
import {compose} from 'redux'
import _ from 'lodash'

import {Logger} from './logging'
import {walletIsInitializedSelector} from '../selectors'

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
export const onWillUnmount = <
  Props,
  Callback: (any) => mixed,
>(
    willUnmount: Callback,
  ): HOC<Props, Props> => (
    BaseComponent: ComponentType<Props>,
  ): ComponentType<Props> =>
    class OnWillUnmount extends React.Component<Props> {
      componentWillUnmount = () => {
        willUnmount(this.props)
      }

      render = () => {
        return <BaseComponent {...this.props} />
      }
    }

// prettier-ignore
export const onDidUpdate = <Props, Callback: (any, any) => mixed>(
  didUpdate: Callback,
): HOC<Props, Props> => (
    BaseComponent: ComponentType<Props>,
  ): ComponentType<Props> =>
    class OnDidMount extends React.Component<Props> {
      componentDidUpdate = (prevProps: Props) => {
        didUpdate(this.props, prevProps)
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
  paramName?: string
):HOC<Props, Props> => (BaseComponent) =>
    class WithScreenTitle extends React.Component<Props> {
      componentDidMount = () => {
        this.setTitle(getTitle(this.props))
      }

      componentDidUpdate = () => {
        // Note(ppershing): At this place we would normally check
        // shallowCompare(this.props, prevProps) and only rerender
        // if some prop changed.
        // Unfortunately, setting navigation.setParams will update props
        // and so we get into an infinity loop.
        // The solution is to *assume* getTitle to be deterministic
        // and diff on title instead
        const current = this.getCurrentTitle()
        const updated = getTitle(this.props)

        if (current !== updated) {
          this.setTitle(updated)
        }
      }

      getCurrentTitle = () => this.props.navigation.getParam(
        paramName || 'title'
      )

      setTitle = (value) => this.props.navigation.setParams({
        [paramName || 'title']: value,
      })

      render = () => <BaseComponent {...this.props} />
    }

export class RenderCount extends React.Component<{}> {
  count = 0

  render() {
    this.count += 1
    return <Text>RenderCount: {this.count} </Text>
  }
}

export const measureRenderTime = <Props>(name: string): HOC<Props, Props> => (
  BaseComponent,
) =>
  class MeasureRenderTime extends React.Component<Props> {
    logProfile = (id, phase, actualTime, baseTime, startTime, commitTime) => {
      Logger.debug('Render time measurement results')
      Logger.debug(`${id}'s ${phase} phase:`)
      Logger.debug(`Actual time: ${actualTime}`)
      Logger.debug(`Base time: ${baseTime}`)
      Logger.debug(`Start time: ${startTime}`)
      Logger.debug(`Commit time: ${commitTime}`)
    }

    render() {
      return (
        <Profiler id={name} onRender={this.logProfile}>
          <BaseComponent {...this.props} />
        </Profiler>
      )
    }
  }

// TODO(ppershing): figure out how to constrain 'any' here.
// Note that simply replacing 'any' with Props (or Subprops)
// turns flow into I-ignore-type-errors beast :-(
// prettier-ignore
export const requireLoaded = <
  Props,
  Callback: (any) => mixed,
>(
    isLoaded: Callback,
    Loading: ComponentType<{}> = () => null
  ): HOC<Props, Props> => (
    BaseComponent: ComponentType<Props>,
  ): ComponentType<Props> =>
    (props) => isLoaded(props) ? <BaseComponent {...props} /> : <Loading />

// TODO hardcoded string
export const requireInitializedWallet = compose(
  connect((state) => ({
    _walletIsInitialized: walletIsInitializedSelector(state),
  })),
  requireLoaded(
    ({_walletIsInitialized}) => _walletIsInitialized,
    () => <Text>l10n Please wait while wallet is initialized...</Text>,
  ),
)

// inspired by
// https://gitlab.com/ryo33/react-throttle-render/blob/master/src/index.js
// We keep it here for safety as the npm package does not seem to be
// have too many users and there is not much activity in the repo either
export const throttleProps = <Props: {}>(wait: number, options: any) => (
  BaseComponent: ComponentType<Props>,
): ComponentType<Props> =>
  class Throttle extends React.Component<any, any> {
    state = {}

    throttledSetState = _.throttle(
      (nextState) => this.setState(nextState),
      wait,
      options,
    )

    // eslint-disable-next-line react/no-deprecated
    componentWillMount() {
      this.throttledSetState({props: this.props})
    }

    // eslint-disable-next-line react/no-deprecated
    componentWillReceiveProps(nextProps) {
      this.throttledSetState({props: nextProps})
    }

    shouldComponentUpdate(nextProps, nextState) {
      return this.state !== nextState
    }

    componentWillUnmount() {
      this.throttledSetState.cancel()
    }

    render() {
      return React.createElement(BaseComponent, this.state.props)
    }
  }

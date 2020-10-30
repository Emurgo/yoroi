// @flow
// $FlowFixMe unstable_Profiler is missing fron react annotation
import React, {unstable_Profiler as Profiler} from 'react'
import {connect} from 'react-redux'
import {Text} from 'react-native'
import {compose} from 'redux'
import {Logger} from './logging'

import type {State} from '../state'
import {walletIsInitializedSelector} from '../selectors'

import type {ComponentType} from 'react'
import type {HOC} from 'recompose'

// prettier-ignore
export const onDidMount = <
  Props: {},
  Callback: $Shape<Props> => mixed,
>(
    didMount: Callback,
  ): HOC<Props, Props> => (
    BaseComponent: ComponentType<Props>,
  ): ComponentType<{ ...Props }> =>
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
  Props: {},
  Callback: $Shape<Props> => mixed,
>(
    willUnmount: Callback,
  ): HOC<Props, Props> => (
    BaseComponent: ComponentType<Props>,
  ): ComponentType<{ ...Props }> =>
    class OnWillUnmount extends React.Component<Props> {
      componentWillUnmount = () => {
        willUnmount(this.props)
      }

      render = () => {
        return <BaseComponent {...this.props} />
      }
    }

// prettier-ignore
export const onDidUpdate = <
  Props: {},
  Callback: ($Shape<Props>, $Shape<Props>) => mixed,
>(
    didUpdate: Callback,
  ): HOC<Props, Props> => (
    BaseComponent: ComponentType<Props>,
  ): ComponentType<{ ...Props }> =>
    class OnDidMount extends React.Component<Props> {
      componentDidUpdate = (prevProps: Props) => {
        didUpdate(this.props, prevProps)
      }

      render = () => {
        return <BaseComponent {...this.props} />
      }
    }

// prettier-ignore
export const withNavigationTitle = <Props: {navigation: any, route: any}>(
  getTitle: (Props) => string,
  paramName?: string
): HOC<Props, Props> => (
    BaseComponent: ComponentType<Props>,
  ): ComponentType<{ ...Props }> =>
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

      getCurrentTitle = () => {
        return paramName != null
          ? this.props.route.params[paramName]
          : this.props.route.params?.title ?? ''
      }

      setTitle = (value) => this.props.navigation.setOptions({
        // future note: flow doesn't support computed keys
        [paramName != null ? paramName : 'title']: value,
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

// prettier-ignore
export const measureRenderTime = <Props: {}>(
  name: string,
): HOC<Props, Props> => (
    BaseComponent: ComponentType<Props>,
  ): ComponentType<{...Props}> =>
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

// prettier-ignore
export const requireLoaded = <
  BaseProps: {},
  HoCProps: {},
  Callback: { ...BaseProps, ...HoCProps } => mixed,
>(
    isLoaded: Callback,
    Loading: ComponentType<{}> = () => null
  ): HOC<BaseProps, { ...BaseProps, ...HoCProps }> => (
    BaseComponent: ComponentType<{ ...BaseProps }>,
  ): ComponentType<{ ...BaseProps }> =>
    class BaseOrLoading extends React.Component<{ ...BaseProps, ...HoCProps }> {
      render() {
        return (
          isLoaded(this.props)
            ? <BaseComponent {...this.props} />
            : <Loading />
        )
      }
    }

export const requireInitializedWallet: <Props>(
  Component: ComponentType<Props>,
) => ComponentType<Props> = compose(
  connect<{}, {_walletIsInitialized: boolean}, _, _, _, _>((state: State) => ({
    _walletIsInitialized: walletIsInitializedSelector(state),
  })),
  requireLoaded<_, {_walletIsInitialized: boolean}, _>(
    ({_walletIsInitialized}) => _walletIsInitialized,
    // TODO hardcoded string
    () => <Text>l10n Please wait while wallet is initialized...</Text>,
  ),
)

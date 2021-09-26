// @flow

// $FlowFixMe unstable_Profiler is missing fron react annotation
import React, {unstable_Profiler as Profiler} from 'react'
import {Text} from 'react-native'
import {Logger} from './logging'

import type {ComponentType} from 'react'
import type {HOC} from 'recompose'

export const onDidMount =
  <Props: {}, Callback: ($Shape<Props>) => mixed>(didMount: Callback): HOC<Props, Props> =>
  (BaseComponent: ComponentType<Props>): ComponentType<{...Props}> =>
    class OnDidMount extends React.Component<Props> {
      componentDidMount = () => {
        didMount(this.props)
      }

      render = () => {
        return <BaseComponent {...this.props} />
      }
    }

export const onWillUnmount =
  <Props: {}, Callback: ($Shape<Props>) => mixed>(willUnmount: Callback): HOC<Props, Props> =>
  (BaseComponent: ComponentType<Props>): ComponentType<{...Props}> =>
    class OnWillUnmount extends React.Component<Props> {
      componentWillUnmount = () => {
        willUnmount(this.props)
      }

      render = () => {
        return <BaseComponent {...this.props} />
      }
    }

export const withNavigationTitle =
  <Props: {navigation: any, route: any}>(getTitle: (Props) => string, paramName?: string): HOC<Props, Props> =>
  (BaseComponent: ComponentType<Props>): ComponentType<{...Props}> =>
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
          ? this.props.route.params
            ? this.props.route.params[paramName]
            : undefined
          : this.props.route?.params?.title ?? undefined
      }

      setTitle = (value) => {
        const options = {}
        if (paramName != null) {
          options[paramName] = value
        } else {
          options.title = value
        }
        this.props.navigation.setOptions(options)
      }

      render = () => <BaseComponent {...this.props} />
    }

export class RenderCount extends React.Component<{}> {
  count = 0

  render() {
    this.count += 1
    return <Text>RenderCount: {this.count} </Text>
  }
}

export const measureRenderTime =
  <Props: {}>(name: string): HOC<Props, Props> =>
  (BaseComponent: ComponentType<Props>): ComponentType<{...Props}> =>
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

export const useNavigationTitle = <Props: {navigation: any, route: any}>({
  getTitle,
  paramName,
  props,
}: {
  getTitle: (Props) => string,
  paramName?: string,
  props: Props,
}) => {
  const getCurrentTitle = () => {
    return paramName != null
      ? props.route.params
        ? props.route.params[paramName]
        : undefined
      : props.route?.params?.title ?? undefined
  }

  const setTitle = (value) => {
    const options = {}
    if (paramName != null) {
      options[paramName] = value
    } else {
      options.title = value
    }
    props.navigation.setOptions(options)
  }

  React.useEffect(() => {
    // Note(ppershing): At this place we would normally check
    // shallowCompare(props, prevProps) and only rerender
    // if some prop changed.
    // Unfortunately, setting navigation.setParams will update props
    // and so we get into an infinity loop.
    // The solution is to *assume* getTitle to be deterministic
    // and diff on title instead
    const current = getCurrentTitle()
    const updated = getTitle(props)

    if (current !== updated) {
      setTitle(updated)
    }
  })
}

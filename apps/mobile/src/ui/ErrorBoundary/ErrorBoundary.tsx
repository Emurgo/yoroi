import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {
  BackHandler,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native'

import {logger} from '../../kernel/logger/logger'
import {Button} from '../Button/Button'
import {CopyButton} from '../CopyButton/CopyButton'
import {Space, SpaceHeight} from '../Space/Space'
import {ExpandableItem} from './ExpandableItem/ExpandableItem'

// TODO: Add error image
interface Props {
  children: React.ReactNode
  debug?: boolean
}

interface State {
  hasError: boolean
  error: string
  errorInfo: string
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: '',
    errorInfo: '',
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(error, {errorInfo})
    
    if (__DEV__) {
      console.error('Error caught by ErrorBoundary:', error)
      console.error('Error Info:', errorInfo)
    }
    
    this.setState({
      error: error.toString(),
      errorInfo: JSON.stringify(errorInfo),
    })
  }

  public static getDerivedStateFromError(_error: Error): State {
    return {hasError: true, error: '', errorInfo: ''}
  }

  render() {
    if (this.state.hasError) {
      return <ErrorView state={this.state} debug={this.props.debug} />
    }
    return this.props.children
  }
}

const ErrorView = ({state, debug}: {state: State; debug?: boolean}) => {
  const {palette: p, atoms: ta} = useTheme()

  return (
    <View
      style={[
        a.px_lg,
        a.pb_lg,
        a.flex_1,
        a.justify_center,
        a.align_center,
        ta.bg_color_max,
        debug && {borderWidth: 2, borderColor: 'red'},
      ]}
    >
      <SpaceHeight size={70} />

      <ScrollView style={[a.w_full]}>
        <View style={[a.align_center]}>
          <Text style={[a.heading_4_regular, {color: p.el_gray_max}]}>
            Oops!!! Something went wrong.
          </Text>

          <Space.Height.xl />

          {/* <Image source={errorImage} /> */}
        </View>

        <Space.Height.lg />

        <Text style={[a.body_2_md_regular, {color: p.el_gray_max}]}>
          Please consider sending this error to Yoroi mobile support.
          Unfortunately, we can not recover from this error. You need to
          relaunch the app.
        </Text>

        <Space.Height.lg />

        <View style={[a.py_lg]}>
          <View style={[a.flex_row, a.justify_between]}>
            <Text style={[a.body_2_md_regular, {color: p.el_gray_max}]}>
              {state.error}
            </Text>

            <CopyButton value={`${state.error}:${state.errorInfo}`} />
          </View>

          <Space.Height.lg />

          <ExpandableItem label="Show error" content={state.errorInfo} />
        </View>
      </ScrollView>

      {Platform.OS === 'android' && (
        <View style={[a.w_full]}>
          <Button onPress={() => BackHandler.exitApp()} title="OK" />
        </View>
      )}
    </View>
  )
}

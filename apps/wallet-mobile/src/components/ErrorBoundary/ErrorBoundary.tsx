import {useTheme} from '@yoroi/theme'
import React, {Component, ErrorInfo, ReactNode} from 'react'
import {BackHandler, Image, Platform, ScrollView, StyleSheet, Text, View} from 'react-native'

import errorImage from '../../assets/img/error.png'
import {logger} from '../../kernel/logger/logger'
import {Button} from '../Button/Button'
import {CopyButton} from '../CopyButton'
import {Space} from '../Space/Space'
import {Spacer} from '../Spacer/Spacer'
import {ExpandableItem} from './ExpandableItem'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: string
  errorInfo: string
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: '',
    errorInfo: '',
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(error, {errorInfo})
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
      return <ErrorView state={this.state} />
    }
    return this.props.children
  }
}

const ErrorView = ({state}: {state: State}) => {
  const styles = useStyles()

  return (
    <View style={styles.root}>
      <Spacer height={70} />

      <ScrollView style={styles.scroll}>
        <View style={styles.headerView}>
          <Text style={styles.title}>Oops!!! Something went wrong.</Text>

          <Space height="xl" />

          <Image source={errorImage} />
        </View>

        <Space height="lg" />

        <Text style={styles.paragraph}>
          Please consider sending this error to Yoroi mobile support. Unfortunately, we can not recover from this error.
          You need to relaunch the app.
        </Text>

        <Space height="lg" />

        <View style={styles.errorSection}>
          <View style={styles.errorSectionHeader}>
            <Text style={styles.paragraph}>{state.error}</Text>

            <CopyButton value={`${state.error}:${state.errorInfo}`} />
          </View>

          <Space height="lg" />

          <ExpandableItem label="Show error" content={state.errorInfo} />
        </View>
      </ScrollView>

      {Platform.OS === 'android' && (
        <View style={styles.actions}>
          <Button onPress={() => BackHandler.exitApp()} title="OK" />
        </View>
      )}
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.px_lg,
      ...atoms.pb_lg,
      ...atoms.flex_1,
      ...atoms.justify_center,
      ...atoms.align_center,
      backgroundColor: color.bg_color_max,
    },
    scroll: {
      ...atoms.w_full,
    },
    title: {
      ...atoms.heading_4_regular,
      color: color.el_gray_max,
    },
    headerView: {
      ...atoms.align_center,
    },
    paragraph: {
      ...atoms.body_2_md_regular,
      color: color.el_gray_max,
    },
    errorSection: {
      ...atoms.py_lg,
      color: color.el_gray_max,
    },
    errorSectionHeader: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      color: color.el_gray_max,
    },
    actions: {
      ...atoms.w_full,
    },
  })
  return styles
}

import {useTheme} from '@yoroi/theme'
import React, {Component, ErrorInfo, ReactNode} from 'react'
import {BackHandler, Image, Platform, ScrollView, StyleSheet, Text, View} from 'react-native'

import errorImage from '../../assets/img/error.png'
import {logger} from '../../kernel/logger/logger'
import {Button} from '../Button/NewButton'
import {CopyButton} from '../CopyButton'
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
      <ScrollView style={styles.scroll}>
        <View style={styles.headerView}>
          <Text style={styles.title}>Oops!!! Something went wrong.</Text>

          <Spacer height={24} />

          <Image source={errorImage} />
        </View>

        <Spacer height={16} />

        <Text style={styles.paragraph}>
          Please consider sending this error to Yoroi mobile support. Unfortunately, we can not recover from this error.
          You need to relaunch the app.
        </Text>

        <Spacer height={16} />

        <View style={styles.errorSection}>
          <View style={styles.errorSectionHeader}>
            <Text style={styles.paragraph}>{state.error}</Text>

            <CopyButton value={`${state.error}:${state.errorInfo}`} />
          </View>

          <Spacer height={16} />

          <ExpandableItem label="Show error" content={state.errorInfo} />
        </View>
      </ScrollView>

      {Platform.OS === 'android' && (
        <View style={{padding: 16}}>
          <Button onPress={() => BackHandler.exitApp()} title="OK" style={{width: '100%'}} />
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
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 70,
      backgroundColor: color.bg_color_max,
    },
    scroll: {
      width: '100%',
    },
    title: {
      ...atoms.heading_4_regular,
      color: color.el_gray_max,
    },
    headerView: {
      alignItems: 'center',
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      color: color.el_gray_max,
    },
  })
  return styles
}

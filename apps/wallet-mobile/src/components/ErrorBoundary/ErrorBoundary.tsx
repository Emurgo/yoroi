import React, {Component, ErrorInfo, ReactNode} from 'react'
import {BackHandler, Image, Platform, ScrollView, StyleSheet, Text, View} from 'react-native'
import {Divider} from 'react-native-paper'

import errorImage from '../../assets/img/error.png'
import {Logger} from '../../legacy/logging'
import {ExpandableItem} from '../../WalletInit/WalletInit/ExpandableItem'
import {Button} from '../Button/Button'
import {CopyButton} from '../CopyButton'
import {Spacer} from '../Spacer'

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
    Logger.error('ErrorBoundary::Error: ' + JSON.stringify(error))
    Logger.error('ErrorBoundary::ErrorInfo: ' + JSON.stringify(errorInfo))
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
      return (
        <View style={styles.root}>
          <ScrollView>
            <View style={styles.headerView}>
              <Text style={styles.title}>Oops!!! Something went wrong.</Text>

              <Spacer height={24} />

              <Image source={errorImage} />
            </View>

            <Divider />

            <Spacer height={16} />

            <Text style={styles.paragraph}>
              Please consider sending this error to Yoroi mobile support. Unfortunately, we can not recover from this
              error. You need to relaunch the app.
            </Text>

            <Spacer height={16} />

            <View style={styles.errorSection}>
              <View style={styles.errorSectionHeader}>
                <Text style={styles.paragraph}>{this.state.error}</Text>

                <CopyButton value={`${this.state.error}:${this.state.errorInfo}`} />
              </View>

              <Spacer height={16} />
            </View>

            <ExpandableItem label="Show error" content={this.state.errorInfo} />
          </ScrollView>

          {Platform.OS === 'android' && (
            <Actions style={{padding: 16}}>
              <Button onPress={() => BackHandler.exitApp()} title="OK" style={{width: '100%'}} />
            </Actions>
          )}
        </View>
      )
    }
    return this.props.children
  }
}

const Actions = (props) => {
  return <View {...props} />
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 70,
  },
  title: {
    fontFamily: 'Rubik-Medium',
  },
  headerView: {
    alignItems: 'center',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 18,
  },
  errorSection: {
    paddingVertical: 16,
  },
  errorSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

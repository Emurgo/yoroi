import React, {Component, ErrorInfo, ReactNode} from 'react'
import {Text, View} from 'react-native'

import {Logger} from '../../../legacy/utils/logging'

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
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 12,
            paddingTop: 80,
          }}
        >
          <Text>Oops!!! Something went wrong..</Text>
          <Text>Error: {this.state.error}</Text>
          <Text>Error Info: {this.state.errorInfo}</Text>
        </View>
      )
    }
    return this.props.children
  }
}

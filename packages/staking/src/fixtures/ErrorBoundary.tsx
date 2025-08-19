import * as React from 'react'
import {View, Text} from 'react-native'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  }

  static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error}
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View testID="hasError">
          <Text>hasError</Text>
          <Text>{JSON.stringify(this.state.error)}</Text>
        </View>
      )
    }

    return this.props.children
  }
}

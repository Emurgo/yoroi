import React, {Component, ReactNode} from 'react'
import {View, Text} from 'react-native'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  }

  static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error}
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

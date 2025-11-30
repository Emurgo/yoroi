import * as React from 'react'
import {
  FallbackProps,
  ErrorBoundary as ReactErrorBoundary,
} from 'react-error-boundary'
import {Text, View} from 'react-native'

interface Props {
  children: React.ReactNode
}

const ErrorFallback = ({error}: FallbackProps) => {
  return (
    <View testID="hasError">
      <Text>hasError</Text>
      <Text>{JSON.stringify(error)}</Text>
    </View>
  )
}

export const ErrorBoundary = ({children}: Props): React.ReactElement => {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  )
}

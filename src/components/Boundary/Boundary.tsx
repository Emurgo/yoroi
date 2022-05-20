import React, {SuspenseProps} from 'react'
import {ErrorBoundary, ErrorBoundaryProps, FallbackProps} from 'react-error-boundary'
import {ActivityIndicator, ActivityIndicatorProps, Image, StyleSheet, View, ViewStyle} from 'react-native'

import image from '../../assets/img/error.png'
import {Button} from '../Button'
import {Text} from '../Text'

type BoundaryProps = LoadingBoundaryProps & CatchBoundaryProps

export const Boundary: React.FC<BoundaryProps> = (props) => {
  return (
    <LoadingBoundary {...props}>
      <CatchBoundary {...props} />
    </LoadingBoundary>
  )
}

type LoadingBoundaryProps = {
  suspend?: boolean
  loadingFallback?: SuspenseProps['fallback']
  debug?: boolean
}

const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({children, suspend = true, loadingFallback, debug}) => {
  if (suspend) {
    return <React.Suspense fallback={loadingFallback || <LoadingFallback debug={debug} />}>{children}</React.Suspense>
  }

  return <>{children}</>
}

type LoadingFallbackProps = {debug?: boolean; style?: ViewStyle} & Omit<ActivityIndicatorProps, 'style'>
export const LoadingFallback: React.FC<LoadingFallbackProps> = ({debug, size = 'large', color = 'black', style}) => (
  <View style={[styles.container, debug && styles.debug, style]}>
    <ActivityIndicator size={size} color={color} />
  </View>
)

type CatchBoundaryProps = {
  error?: boolean
  errorFallback?: ErrorBoundaryProps['fallbackRender']
  debug?: boolean
}

const CatchBoundary: React.FC<CatchBoundaryProps> = ({children, error = true, errorFallback, debug}) => {
  if (!error) {
    return <>{children}</>
  }

  if (errorFallback) {
    return <ErrorBoundary fallbackRender={errorFallback}>{children}</ErrorBoundary>
  }

  return (
    <ErrorBoundary fallbackRender={(props) => <ErrorFallback debug={debug} {...props} />}>{children}</ErrorBoundary>
  )
}

type ErrorFallbackProps = FallbackProps & {debug?: boolean; reset?: boolean}
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({error, resetErrorBoundary, debug, reset = true}) => (
  <View style={[styles.container, debug && styles.debug]}>
    <Text>{error.message}</Text>
    <Image source={image} />
    {reset && <Button title="Try again" onPress={resetErrorBoundary} />}
  </View>
)

const styles = StyleSheet.create({
  debug: {backgroundColor: 'pink', opacity: 0.5},
  container: {alignItems: 'center', justifyContent: 'center', padding: 16},
})

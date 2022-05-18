import React, {SuspenseProps} from 'react'
import {ErrorBoundary, ErrorBoundaryProps} from 'react-error-boundary'
import {ActivityIndicator, ActivityIndicatorProps, Image, StyleSheet, View, ViewStyle} from 'react-native'

import image from '../../assets/img/error.png'

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

type FallbackProps = {debug?: boolean; style?: ViewStyle} & Omit<ActivityIndicatorProps, 'style'>

export const LoadingFallback: React.FC<FallbackProps> = ({debug, size = 'large', color = 'black', style}) => (
  <View style={[styles.container, debug && styles.debug, style]}>
    <ActivityIndicator size={size} color={color} />
  </View>
)

type CatchBoundaryProps = {
  error?: boolean
  errorFallback?: ErrorBoundaryProps['fallback']
  errorFallbackRender?: ErrorBoundaryProps['fallbackRender']
  debug?: boolean
}

const CatchBoundary: React.FC<CatchBoundaryProps> = ({
  children,
  error = true,
  errorFallbackRender,
  errorFallback,
  debug,
}) => {
  if (!error) {
    return <>{children}</>
  }

  if (errorFallbackRender) {
    return <ErrorBoundary fallbackRender={errorFallbackRender}>{children}</ErrorBoundary>
  }

  if (errorFallback) {
    return <ErrorBoundary fallback={errorFallback}>{children}</ErrorBoundary>
  }

  return <ErrorBoundary fallback={<ErrorFallback debug={debug} />}>{children}</ErrorBoundary>
}

export const ErrorFallback: React.FC<{debug?: boolean}> = ({debug}) => (
  <View style={[styles.container, debug && styles.debug]}>
    <Image source={image} />
  </View>
)

const styles = StyleSheet.create({
  debug: {backgroundColor: 'pink', opacity: 0.5},
  container: {alignItems: 'center', justifyContent: 'center', padding: 16},
})

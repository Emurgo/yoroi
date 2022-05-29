import React, {SuspenseProps} from 'react'
import {ErrorBoundary, ErrorBoundaryProps, FallbackProps} from 'react-error-boundary'
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  Image,
  LayoutAnimation,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'

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
  loading?: boolean
  loadingFallback?: SuspenseProps['fallback']
}

const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({children, loading = true, loadingFallback}) => {
  if (loading) {
    return <React.Suspense fallback={loadingFallback || <LoadingFallback />}>{children}</React.Suspense>
  }

  return <>{children}</>
}

type LoadingFallbackProps = {debug?: boolean; style?: ViewStyle} & Omit<ActivityIndicatorProps, 'style'>
export const LoadingFallback: React.FC<LoadingFallbackProps> = ({size = 'large', color = 'black', style}) => (
  <View style={[styles.container, style]}>
    <ActivityIndicator size={size} color={color} />
  </View>
)

type CatchBoundaryProps = {
  catch?: boolean
  errorFallback?: ErrorBoundaryProps['fallbackRender']
}

const CatchBoundary: React.FC<CatchBoundaryProps> = ({children, ...props}) =>
  props.catch === false ? (
    <>{children}</>
  ) : props.errorFallback ? (
    <ErrorBoundary fallbackRender={props.errorFallback}>{children}</ErrorBoundary>
  ) : (
    <ErrorBoundary fallbackRender={(props) => <ErrorFallback {...props} />}>{children}</ErrorBoundary>
  )

type ErrorFallbackProps = FallbackProps & {debug?: boolean; reset?: boolean}
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({error, resetErrorBoundary, reset = true}) => (
  <View style={styles.container}>
    <View style={styles.errorHeader}>
      <Text>{error.message}</Text>
    </View>

    <Image source={image} />
    {reset && (
      <Button
        title="Try again"
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
          resetErrorBoundary()
        }}
      />
    )}
  </View>
)

const styles = StyleSheet.create({
  container: {alignItems: 'center', justifyContent: 'center'},
  errorHeader: {alignItems: 'center', justifyContent: 'center', padding: 16},
})

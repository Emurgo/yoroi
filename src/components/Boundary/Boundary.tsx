import React, {SuspenseProps} from 'react'
import {
  ErrorBoundary as ReactErrorBoundary,
  ErrorBoundaryProps as ReactErrorBoundaryProps,
  FallbackProps,
} from 'react-error-boundary'
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

type BoundaryProps = LoadingBoundaryProps & ErrorBoundaryProps

export const Boundary: React.FC<BoundaryProps> = (props) => {
  return (
    <LoadingBoundary {...props}>
      <ErrorBoundary {...props} />
    </LoadingBoundary>
  )
}

type LoadingBoundaryProps = {
  loading?: {fallback?: SuspenseProps['fallback']; fallbackProps?: LoadingFallbackProps; enabled?: boolean}
}
const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({children, ...props}) => {
  if (props.loading?.enabled === false) return <>{children}</>

  return (
    <React.Suspense fallback={props.loading?.fallback || <LoadingFallback {...props.loading?.fallbackProps} />}>
      {children}
    </React.Suspense>
  )
}

type LoadingFallbackProps = {style?: ViewStyle} & Omit<ActivityIndicatorProps, 'style'>
export const LoadingFallback: React.FC<LoadingFallbackProps> = ({size = 'large', color = 'black', style}) => (
  <View style={[styles.container, style]}>
    <ActivityIndicator size={size} color={color} />
  </View>
)

type ErrorBoundaryProps = {error?: {fallback?: ReactErrorBoundaryProps['fallbackRender']; enabled?: boolean}}
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({children, ...props}) => {
  if (props.error?.enabled === false) return <>{children}</>

  const fallbackRender = (fallbackProps: ErrorFallbackProps) =>
    props.error?.fallback?.(fallbackProps) || <ErrorFallback {...fallbackProps} />

  return <ReactErrorBoundary fallbackRender={fallbackRender}>{children}</ReactErrorBoundary>
}

type ErrorFallbackProps = FallbackProps & {reset?: boolean}
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

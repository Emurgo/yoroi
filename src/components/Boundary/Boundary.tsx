import React, {SuspenseProps} from 'react'
import {
  ErrorBoundary as ReactErrorBoundary,
  ErrorBoundaryProps as ReactErrorBoundaryProps,
  FallbackProps,
} from 'react-error-boundary'
import {MessageDescriptor, useIntl} from 'react-intl'
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

export const Boundary = (props: BoundaryProps) => {
  return (
    <LoadingBoundary {...props}>
      <ErrorBoundary {...props} />
    </LoadingBoundary>
  )
}

type LoadingBoundaryProps = {
  loading?: {
    fallback?: SuspenseProps['fallback']
    fallbackProps?: LoadingFallbackProps
    enabled?: boolean
  }
  children: React.ReactNode
}
const LoadingBoundary = ({children, ...props}: LoadingBoundaryProps) => {
  if (props.loading?.enabled === false) return <>{children}</>

  return (
    <React.Suspense fallback={props.loading?.fallback ?? <LoadingFallback {...props.loading?.fallbackProps} />}>
      {children}
    </React.Suspense>
  )
}

type LoadingFallbackProps = {style?: ViewStyle} & Omit<ActivityIndicatorProps, 'style'>
export const LoadingFallback = ({size = 'large', color = 'black', style}: LoadingFallbackProps) => (
  <View style={[styles.container, style]}>
    <ActivityIndicator size={size} color={color} />
  </View>
)

type ErrorBoundaryProps = {
  error?: {
    fallback?: ReactErrorBoundaryProps['fallbackRender']
    enabled?: boolean
    size?: ErrorFallbackProps['size']
  }
  children: React.ReactNode
}
const ErrorBoundary = ({children, ...props}: ErrorBoundaryProps) => {
  if (props.error?.enabled === false) return <>{children}</>

  const fallbackRender = (fallbackProps: ErrorFallbackProps) =>
    props.error?.fallback?.(fallbackProps) || <ErrorFallback {...fallbackProps} size={props.error?.size} />

  return <ReactErrorBoundary fallbackRender={fallbackRender}>{children}</ReactErrorBoundary>
}

type ErrorFallbackProps = {
  error: FallbackProps['error'] & MessageDescriptor
  resetErrorBoundary: FallbackProps['resetErrorBoundary']
  reset?: boolean
  size?: 'small' | 'large' | undefined
}

export const ErrorFallback = ({error, resetErrorBoundary, reset = true, size = 'large'}: ErrorFallbackProps) => {
  const intl = useIntl()
  return (
    <View style={[styles.container, {flex: size === 'large' ? 1 : undefined}]}>
      <View style={styles.errorHeader}>
        <Text>
          {error.defaultMessage !== undefined && error.id !== undefined ? intl.formatMessage(error) : error.message}
        </Text>
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
}

const styles = StyleSheet.create({
  container: {alignItems: 'center', justifyContent: 'center'},
  errorHeader: {alignItems: 'center', justifyContent: 'center', padding: 20},
})

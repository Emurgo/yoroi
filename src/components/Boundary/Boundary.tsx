import React, {SuspenseProps} from 'react'
import {
  ErrorBoundary as ReactErrorBoundary,
  ErrorBoundaryProps as ReactErrorBoundaryProps,
  FallbackProps,
} from 'react-error-boundary'
import {useIntl} from 'react-intl'
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  Image,
  LayoutAnimation,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

import image from '../../assets/img/error.png'
import LocalizableError from '../../i18n/LocalizableError'
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
    size?: 'large' | 'small' | 'inline'
  }
  children: React.ReactNode
}
const ErrorBoundary = ({children, ...props}: ErrorBoundaryProps) => {
  if (props.error?.enabled === false) return <>{children}</>

  const fallbackRender = (fallbackProps: ErrorFallbackProps) => {
    if (props.error?.fallback) {
      return props.error?.fallback(fallbackProps)
    } else if (props.error?.size === 'small') {
      return <SmallErrorFallback {...fallbackProps} />
    } else if (props.error?.size === 'inline') {
      return <InlineErrorFallback {...fallbackProps} />
    }

    return <LargeErrorFallback {...fallbackProps} />
  }

  return <ReactErrorBoundary fallbackRender={fallbackRender}>{children}</ReactErrorBoundary>
}

type ErrorFallbackProps = {
  error: FallbackProps['error'] | LocalizableError
  resetErrorBoundary: FallbackProps['resetErrorBoundary']
  reset?: boolean
}

export const LargeErrorFallback = ({error, resetErrorBoundary, reset = true}: ErrorFallbackProps) => {
  const intl = useIntl()
  return (
    <View style={styles.container}>
      <View style={styles.errorHeader}>
        <Text>{error instanceof LocalizableError ? intl.formatMessage(error) : error.message}</Text>
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

export const SmallErrorFallback = ({error, resetErrorBoundary, reset = true}: ErrorFallbackProps) => {
  const intl = useIntl()
  return (
    <View style={styles.container}>
      <View style={styles.errorHeader}>
        <Text>{error instanceof LocalizableError ? intl.formatMessage(error) : error.message}</Text>
      </View>

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

export const InlineErrorFallback = ({error, resetErrorBoundary, reset}: ErrorFallbackProps) => {
  const intl = useIntl()
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onLongPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
          resetErrorBoundary()
        }}
        style={styles.errorHeader}
        disabled={reset === false}
      >
        <Text>{error instanceof LocalizableError ? intl.formatMessage(error) : error.message}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {alignItems: 'center', justifyContent: 'center'},
  errorHeader: {alignItems: 'center', justifyContent: 'center', padding: 20},
})

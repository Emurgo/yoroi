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
  ViewProps,
} from 'react-native'
import {useQueryErrorResetBoundary} from 'react-query'

import image from '../../assets/img/error.png'
import LocalizableError from '../../i18n/LocalizableError'
import {Button} from '../Button'
import {Text} from '../Text'

type BoundaryProps = {
  loading?: LoadingBoundaryProps
  error?: ErrorBoundaryProps
  debug?: boolean
  children: React.ReactNode
}

export const Boundary = (props: BoundaryProps) => {
  return (
    <LoadingBoundary {...props.loading} debug={props.debug}>
      <ErrorBoundary {...props.error} debug={props.debug}>
        {props.children}
      </ErrorBoundary>
    </LoadingBoundary>
  )
}

type LoadingBoundaryProps = {
  fallback?: SuspenseProps['fallback']
  fallbackProps?: LoadingFallbackProps
  enabled?: boolean
  debug?: boolean
}
export const LoadingBoundary = ({children, ...props}: LoadingBoundaryProps & {children: React.ReactNode}) => {
  if (props.enabled === false) return <>{children}</>

  return (
    <React.Suspense
      fallback={props.fallback === undefined ? <LoadingFallback {...props.fallbackProps} debug={props.debug} /> : null}
    >
      {children}
    </React.Suspense>
  )
}

type LoadingFallbackProps = {style?: ViewProps['style']; debug?: boolean} & Omit<ActivityIndicatorProps, 'style'>
export const LoadingFallback = ({size = 'large', color = 'black', style, debug = false}: LoadingFallbackProps) => (
  <View style={[styles.container, style, debug && styles.debug]}>
    <ActivityIndicator size={size} color={color} />
  </View>
)

type ErrorBoundaryProps = {
  fallback?: ReactErrorBoundaryProps['fallbackRender']
  enabled?: boolean
  size?: 'large' | 'small' | 'inline'
  debug?: boolean
}
const ErrorBoundary = ({children, ...props}: ErrorBoundaryProps & {children: React.ReactNode}) => {
  const {reset} = useQueryErrorResetBoundary()
  if (props.enabled === false) return <>{children}</>

  const fallbackRender = (fallbackProps: ErrorFallbackProps) => {
    const errorProps = {
      ...fallbackProps,
      debug: props.debug,
      resetErrorBoundary: () => {
        reset()
        fallbackProps.resetErrorBoundary()
      },
    }

    if (props.fallback) {
      return props.fallback(errorProps)
    } else if (props.size === 'small') {
      return <SmallErrorFallback {...errorProps} />
    } else if (props.size === 'inline') {
      return <InlineErrorFallback {...errorProps} />
    }

    return <LargeErrorFallback {...errorProps} />
  }

  return <ReactErrorBoundary fallbackRender={fallbackRender}>{children}</ReactErrorBoundary>
}

type ErrorFallbackProps = {
  error: FallbackProps['error'] | LocalizableError
  resetErrorBoundary: FallbackProps['resetErrorBoundary']
  reset?: boolean
  debug?: boolean
}

export const LargeErrorFallback = ({error, resetErrorBoundary, reset = true, debug}: ErrorFallbackProps) => {
  const intl = useIntl()
  return (
    <View style={[styles.container, debug && styles.debug]}>
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

export const SmallErrorFallback = ({error, resetErrorBoundary, reset = true, debug}: ErrorFallbackProps) => {
  const intl = useIntl()

  return (
    <View style={[styles.container, debug && styles.debug]}>
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

export const InlineErrorFallback = ({error, resetErrorBoundary, reset, debug}: ErrorFallbackProps) => {
  const intl = useIntl()

  return (
    <View style={[styles.container, debug && styles.debug]}>
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorHeader: {alignItems: 'center', justifyContent: 'center', padding: 20},
  debug: {
    backgroundColor: 'pink',
  },
})

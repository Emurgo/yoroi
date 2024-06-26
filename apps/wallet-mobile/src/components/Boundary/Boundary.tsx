import {useQueryErrorResetBoundary} from '@tanstack/react-query'
import React, {SuspenseProps} from 'react'
import {
  ErrorBoundary as ReactErrorBoundary,
  ErrorBoundaryProps as ReactErrorBoundaryProps,
  FallbackProps,
} from 'react-error-boundary'
import {useIntl} from 'react-intl'
import {ActivityIndicator, Image, LayoutAnimation, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'

import image from '../../assets/img/error.png'
import LocalizableError from '../../kernel/i18n/LocalizableError'
import {Button} from '../Button'
import {Spacer} from '../Spacer'
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
  enabled?: boolean
  fallback?: SuspenseProps['fallback']
  style?: ViewProps['style']
  size?: 'full' | 'large' | 'small'
  debug?: boolean
}
export const LoadingBoundary = ({
  children,
  enabled,
  style,
  size,
  debug,
  ...props
}: LoadingBoundaryProps & {children: React.ReactNode}) => {
  if (enabled === false) return <>{children}</>
  const fallback =
    props.fallback === undefined ? <LoadingFallback style={style} size={size} debug={debug} /> : props.fallback

  return <React.Suspense fallback={fallback}>{children}</React.Suspense>
}

type LoadingFallbackProps = {
  style?: ViewProps['style']
  size?: 'full' | 'large' | 'small'
  debug?: boolean
}
export const LoadingFallback = ({size = 'large', style, debug = false}: LoadingFallbackProps) => (
  <View style={[size === 'full' && styles.stretch, styles.container, style, debug && styles.debug]}>
    <ActivityIndicator size={size === 'small' ? 'small' : 'large'} color="black" />
  </View>
)

type ErrorBoundaryProps = {
  fallback?: ReactErrorBoundaryProps['fallbackRender']
  enabled?: boolean
  size?: 'full' | 'large' | 'small' | 'inline'
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
    } else if (props.size === 'full') {
      return <FullErrorFallback {...errorProps} />
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

export const FullErrorFallback = ({error, resetErrorBoundary, reset = true, debug}: ErrorFallbackProps) => {
  const intl = useIntl()
  return (
    <View style={[styles.stretch, styles.container, debug && styles.debug]}>
      <View style={styles.errorHeader}>
        <Text>{error instanceof LocalizableError ? intl.formatMessage(error) : error.message}</Text>
      </View>

      <Spacer height={16} />

      <Image source={image} />

      <Spacer height={16} />

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

export const LargeErrorFallback = ({error, resetErrorBoundary, reset = true, debug}: ErrorFallbackProps) => {
  const intl = useIntl()

  return (
    <View style={[styles.container, debug && styles.debug]}>
      <View style={styles.errorHeader}>
        <Text>{error instanceof LocalizableError ? intl.formatMessage(error) : error.message}</Text>
      </View>

      <Spacer height={16} />

      <Image source={image} />

      <Spacer height={16} />

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

      <Spacer height={16} />

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

export type ResetErrorRef = {
  reset: () => void
}

type ResetErrorProps = {resetErrorBoundary: FallbackProps['resetErrorBoundary']; children: React.ReactNode}
export const ResetError = React.forwardRef<ResetErrorRef, ResetErrorProps>(({resetErrorBoundary, children}, ref) => {
  const {reset} = useQueryErrorResetBoundary()

  React.useImperativeHandle(ref, () => ({
    reset: () => {
      reset()
      resetErrorBoundary()
    },
  }))

  return <>{children}</>
})

const styles = StyleSheet.create({
  stretch: {
    height: '100%',
    width: '100%',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorHeader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  debug: {
    backgroundColor: 'pink',
  },
})

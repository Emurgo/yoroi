import {atoms as a, useTheme} from '@yoroi/theme'

import {useQueryErrorResetBoundary} from '@tanstack/react-query'
import * as React from 'react'
import {
  FallbackProps,
  ErrorBoundary as ReactErrorBoundary,
  ErrorBoundaryProps as ReactErrorBoundaryProps,
} from 'react-error-boundary'
import {ActivityIndicator, StyleProp, View, ViewStyle} from 'react-native'

import {LoadingOverlay} from '../LoadingOverlay/LoadingOverlay'
import {FullErrorFallback} from './FullErrorFallback'
import {InlineErrorFallback} from './InlineErrorFallback'
import {LargeErrorFallback} from './LargeErrorFallback'
import {SmallErrorFallback} from './SmallErrorFallback'
import {ErrorFallbackProps} from './types'

export const Boundary = (props: BoundaryProps) => {
  return (
    <LoadingBoundary {...props.loading} debug={props.debug}>
      <ErrorBoundary {...props.error} debug={props.debug}>
        {props.children}
      </ErrorBoundary>
    </LoadingBoundary>
  )
}

export const LoadingBoundary = ({
  children,
  enabled,
  style,
  size,
  debug,
  ...props
}: LoadingBoundaryProps & {children: React.ReactNode}) => {
  if (!enabled) return <>{children}</>
  const fallback = props.fallback ?? (
    <LoadingFallback style={style} size={size} debug={debug} />
  )

  return <React.Suspense fallback={fallback}>{children}</React.Suspense>
}

const LoadingFallback = ({
  size = 'large',
  style,
  debug = false,
}: LoadingFallbackProps) => {
  const {isDark} = useTheme()

  if (size === 'full') {
    return <LoadingOverlay debug={debug} isLoading={true} />
  }

  return (
    <View style={[style, debug && a.debug]}>
      <ActivityIndicator
        size={size === 'small' ? 'small' : 'large'}
        color={isDark ? 'white' : 'dark'}
      />
    </View>
  )
}

type ErrorBoundaryProps = {
  fallback?: ReactErrorBoundaryProps['fallbackRender']
  enabled?: boolean
  size?: 'full' | 'large' | 'small' | 'inline'
  debug?: boolean
}
const ErrorBoundary = ({
  children,
  ...props
}: ErrorBoundaryProps & {children: React.ReactNode}) => {
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

  return (
    <ReactErrorBoundary fallbackRender={fallbackRender}>
      {children}
    </ReactErrorBoundary>
  )
}

export const ResetError = React.forwardRef<ResetErrorRef, ResetErrorProps>(
  ({resetErrorBoundary, children}, ref) => {
    const {reset} = useQueryErrorResetBoundary()

    React.useImperativeHandle(ref, () => ({
      reset: () => {
        reset()
        resetErrorBoundary()
      },
    }))

    return <>{children}</>
  },
)

type BoundaryProps = React.PropsWithChildren<{
  loading?: LoadingBoundaryProps
  error?: ErrorBoundaryProps
  debug?: boolean
}>

type LoadingBoundaryProps = {
  enabled?: boolean
  fallback?: React.SuspenseProps['fallback']
  style?: StyleProp<ViewStyle>
  size?: 'full' | 'large' | 'small'
  debug?: boolean
}
type LoadingFallbackProps = {
  style?: StyleProp<ViewStyle>
  size?: 'full' | 'large' | 'small'
  debug?: boolean
}
export type ResetErrorRef = {
  reset: () => void
}
type ResetErrorProps = React.PropsWithChildren<{
  resetErrorBoundary: FallbackProps['resetErrorBoundary']
}>

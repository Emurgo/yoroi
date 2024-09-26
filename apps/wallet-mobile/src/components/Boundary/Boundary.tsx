import {useTheme} from '@yoroi/theme'
import React, {SuspenseProps} from 'react'
import {
  ErrorBoundary as ReactErrorBoundary,
  ErrorBoundaryProps as ReactErrorBoundaryProps,
  FallbackProps,
} from 'react-error-boundary'
import {useIntl} from 'react-intl'
import {ActivityIndicator, Image, LayoutAnimation, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'
import {useQueryErrorResetBoundary} from 'react-query'

import image from '../../assets/img/error.png'
import {LocalizableError} from '../../kernel/i18n/LocalizableError'
import {Button} from '../Button/NewButton'
import {Space} from '../Space/Space'
import {Spacer} from '../Spacer/Spacer'
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
const LoadingFallback = ({size = 'large', style, debug = false}: LoadingFallbackProps) => {
  const {isDark} = useTheme()
  const {styles} = useStyles()

  return (
    <View style={[size === 'full' && styles.stretch, styles.container, style, debug && styles.debug]}>
      <ActivityIndicator size={size === 'small' ? 'small' : 'large'} color={isDark ? 'white' : 'dark'} />
    </View>
  )
}

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

const FullErrorFallback = ({error, resetErrorBoundary, reset = true, debug}: ErrorFallbackProps) => {
  const intl = useIntl()
  const {styles} = useStyles()

  return (
    <View style={[styles.stretch, styles.container, debug && styles.debug]}>
      <View style={styles.errorHeader}>
        <Text>{error instanceof LocalizableError ? intl.formatMessage(error) : error.message}</Text>
      </View>

      <Space height="lg" />

      <Image source={image} />

      <Space height="lg" />

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

const LargeErrorFallback = ({error, resetErrorBoundary, reset = true, debug}: ErrorFallbackProps) => {
  const intl = useIntl()
  const {styles} = useStyles()

  return (
    <View style={[styles.container, debug && styles.debug]}>
      <View style={styles.errorHeader}>
        <Text>{error instanceof LocalizableError ? intl.formatMessage(error) : error.message}</Text>
      </View>

      <Space height="lg" />

      <Image source={image} />

      <Space height="lg" />

      {reset && (
        <Button
          title="Try again"
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
            resetErrorBoundary()
          }}
        />
      )}

      <Spacer fill />
    </View>
  )
}

const SmallErrorFallback = ({error, resetErrorBoundary, reset = true, debug}: ErrorFallbackProps) => {
  const intl = useIntl()
  const {styles} = useStyles()

  return (
    <View style={[styles.container, debug && styles.debug]}>
      <View style={styles.errorHeader}>
        <Text>{error instanceof LocalizableError ? intl.formatMessage(error) : error.message}</Text>
      </View>

      <Space height="lg" />

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

const InlineErrorFallback = ({error, resetErrorBoundary, reset, debug}: ErrorFallbackProps) => {
  const intl = useIntl()
  const {styles} = useStyles()

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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    stretch: {
      ...atoms.h_full,
      ...atoms.w_full,
    },
    container: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
      ...atoms.align_center,
      ...atoms.p_lg,
    },
    errorHeader: {
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    debug: {
      backgroundColor: 'pink',
    },
  })

  return {styles}
}

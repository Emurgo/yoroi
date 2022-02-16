import React, {SuspenseProps} from 'react'
import {ActivityIndicator, ActivityIndicatorProps, StyleSheet, View, ViewStyle} from 'react-native'

type BoundaryProps = {
  loadingProps?: SuspenseProps
  fallbackProps?: FallbackProps
  debug?: boolean
}
export const Boundary: React.FC<BoundaryProps> = ({children, fallbackProps, loadingProps, debug}) => (
  <React.Suspense fallback={<LoadingFallback debug={debug} {...fallbackProps} />} {...loadingProps}>
    {children}
  </React.Suspense>
)

type FallbackProps = {debug?: boolean; style?: ViewStyle} & Omit<ActivityIndicatorProps, 'style'>
export const LoadingFallback: React.FC<FallbackProps> = ({debug, size = 'large', color = 'black', style}) => (
  <View style={[styles.container, debug && styles.debug, style]}>
    <ActivityIndicator size={size} color={color} />
  </View>
)

const styles = StyleSheet.create({
  debug: {backgroundColor: 'pink', opacity: 0.5},
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
})

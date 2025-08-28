import {atoms as a, useTheme} from '@yoroi/theme'

import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {ActivityIndicator, StyleSheet, View} from 'react-native'

type LoadingOverlayProps = {
  isLoading?: boolean
  isEmpty?: boolean
  debug?: boolean
  content?: React.ReactNode
}

export const LoadingOverlay = ({
  isLoading,
  isEmpty,
  content,
  debug,
}: LoadingOverlayProps) => {
  const {palette: p, atoms: ta} = useTheme()

  if (!isLoading) return null

  if (isEmpty) {
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          debug ? ta.bg_color_max : a.bg_transparent,
          debug && a.opacity_50,
          a.flex_1,
          a.z_50,
        ]}
      />
    )
  }

  return (
    <LinearGradient
      style={[StyleSheet.absoluteFill, a.opacity_50, a.z_50]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      colors={p.bg_gradient_1}
    >
      <View style={[StyleSheet.absoluteFill, a.align_center, a.justify_center]}>
        {!content && (
          <ActivityIndicator
            animating
            size="large"
            style={[a.p_lg, ta.bg_color_max, a.rounded_md]}
          />
        )}
        {content}
      </View>
    </LinearGradient>
  )
}

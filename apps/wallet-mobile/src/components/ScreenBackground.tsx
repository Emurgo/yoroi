import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {COLORS} from '../theme'

export const ScreenBackground = ({children, style}: ViewProps) => (
  <View style={[styles.container, style]}>{children}</View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_BLUE,
  },
})

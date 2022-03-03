import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {COLORS} from '../../legacy/styles/config'

export const ScreenBackground = ({children, style}: ViewProps) => (
  <View style={[styles.container, style]}>{children}</View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_BLUE,
  },
})

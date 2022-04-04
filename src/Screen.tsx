import React from 'react'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'

import {COLORS} from './theme'

export const screenPadding = 20

export const Screen: React.FC<ViewProps & {scroll?: boolean; bgColor?: string}> = ({
  children,
  scroll,
  bgColor,
  style = {},
  ...restProps
}) => {
  const Container = scroll === true ? ScrollView : View

  return (
    <Container
      {...restProps}
      style={[styles.container, {backgroundColor: bgColor != null ? bgColor : COLORS.WHITE}, style]}
    >
      {children}
    </Container>
  )
}

export default Screen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})

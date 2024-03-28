import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'

export const screenPadding = 20

type Props = ViewProps & {scroll?: boolean; bgColor?: string}
export const Screen = ({children, scroll, bgColor, style = {}, ...restProps}: Props) => {
  const {styles, colors} = useStyles()
  const Container = scroll === true ? ScrollView : View

  return (
    <Container
      {...restProps}
      style={[styles.container, {backgroundColor: bgColor != null ? bgColor : colors.white}, style]}
    >
      {children}
    </Container>
  )
}

export default Screen

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.gray.min,
    },
  })
  const colors = {
    white: color.gray.min,
  }
  return {styles, colors}
}

import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

type Props = {backgroundColor?: string}

export const Line = ({backgroundColor}: Props) => {
  const {styles, colors} = useStyles()

  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: backgroundColor != null ? backgroundColor : colors.background,
      }}
    />
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    container: {
      height: 1,
      opacity: 0.3,
    },
  })

  const colors = {
    background: color.gray[700],
  }

  return {styles, colors}
}

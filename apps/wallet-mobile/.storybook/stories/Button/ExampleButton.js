import React from 'react'
import {StyleSheet, Text, TouchableOpacity} from 'react-native'
import {useTheme} from '@yoroi/theme'

export const ExampleButton = ({onPress, disabled, text}) => {
  const styles = useStyles()

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8} disabled={disabled}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, padding} = theme
  const styles = StyleSheet.create({
    container: {
      ...padding['x-l'],
      ...padding['y-s'],
      backgroundColor: color.primary[500],
      borderRadius: 8,
    },
    text: {color: color.gray.min},
  })

  return styles
}

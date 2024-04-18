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
  const {color, atoms} = theme
  const styles = StyleSheet.create({
    container: {
      ...atoms.px_lg,
      ...atoms.py_sm,
      backgroundColor: color.primary_c500,
      borderRadius: 8,
    },
    text: {color: color.gray_cmin},
  })

  return styles
}

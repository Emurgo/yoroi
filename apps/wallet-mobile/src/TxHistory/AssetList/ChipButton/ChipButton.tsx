import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity} from 'react-native'

type Props = {
  label: string
  onPress: () => void
  disabled?: boolean
  selected?: boolean
}

export const ChipButton = ({label, onPress, disabled, selected}: Props) => {
  const styles = useStyles()

  return (
    <TouchableOpacity style={[styles.button, selected && styles.selected]} onPress={onPress} disabled={disabled}>
      <Text style={[styles.label, selected && styles.label]}>{label}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, padding, typography} = theme
  const styles = StyleSheet.create({
    button: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    },
    label: {
      color: color.gray[600],
      ...padding['x-m'],
      ...padding['y-xs'],
      ...typography['body-2-m-regular'],
    },
    selected: {
      backgroundColor: color.gray[50],
      color: color.gray[900],
    },
  })

  return styles
}

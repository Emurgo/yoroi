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
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    button: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    },
    label: {
      color: color.gray_c600,
      ...atoms.px_md,
      ...atoms.py_xs,
      ...atoms.body_2_md_regular,
    },
    selected: {
      backgroundColor: color.gray_c50,
      color: color.gray_c900,
    },
  })

  return styles
}

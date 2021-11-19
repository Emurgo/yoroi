import React from 'react'
import {StyleSheet, Text, TouchableOpacity} from 'react-native'

type Props = {
  label: string
  onPress: () => void
  disabled?: boolean
  selected?: boolean
}

export const ChipButton = ({label, onPress, disabled, selected}: Props) => (
  <TouchableOpacity style={[styles.button, selected && styles.selected]} onPress={onPress} disabled={disabled}>
    <Text style={[styles.label, selected && styles.label]}>{label}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  label: {
    color: '#6B7384',
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Rubik-Regular',
  },
  selected: {
    backgroundColor: '#F0F3F5',
    color: '#242838',
  },
})

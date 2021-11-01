import React from 'react'
import {StyleSheet, Text} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

type Props = {
  label: string
  onPress: () => void
  disabled?: boolean
  isSelected?: boolean
}

export const ChipButton = (props: Props) => {
  const touchStyle = props.isSelected ? [styles.button, styles.isSelected] : [styles.button]
  const labelStyle = props.isSelected ? [styles.label, styles.isSelected] : [styles.label]

  return (
    <TouchableOpacity style={touchStyle} onPress={props.onPress} disabled={props.disabled}>
      <Text style={labelStyle}>{props.label}</Text>
    </TouchableOpacity>
  )
}

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
  },
  isSelected: {
    backgroundColor: '#F0F3F5',
    color: '#242838',
  },
})

import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {COLORS} from '../../../../theme'

interface ButtonGroupProps {
  labels: string[]
  onSelect: (index: number) => void
  selected: number
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({labels, onSelect, selected}) => {
  const handleOnPress = (index: number) => onSelect(index)

  return (
    <View style={styles.container}>
      {labels.map((buttonLabel, index) => (
        <View key={buttonLabel} style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={() => handleOnPress(index)}
            style={[styles.button, index === selected && styles.selected]}
          >
            <Text style={styles.label}>{buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  buttonWrapper: {
    paddingRight: 8,
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selected: {
    backgroundColor: COLORS.BORDER_GRAY,
  },
  label: {
    color: COLORS.BLACK,
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
    lineHeight: 24,
    fontSize: 16,
  },
})

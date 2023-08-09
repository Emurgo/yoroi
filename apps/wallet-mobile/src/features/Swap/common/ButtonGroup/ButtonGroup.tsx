import React, {useState} from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {COLORS} from '../../../../theme'

interface ButtonGroupProps {
  buttons: string[]
  onPress: (index: number) => void
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({buttons, onPress}) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleClick = (index: number) => {
    setSelectedIndex(index)
    onPress(index)
  }

  return (
    <View style={styles.container}>
      {buttons.map((buttonLabel, index) => (
        <View key={buttonLabel} style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={() => handleClick(index)}
            style={[styles.customButton, index === selectedIndex && styles.activeButton]}
          >
            <Text style={styles.buttonText}>{buttonLabel}</Text>
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
  customButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  activeButton: {
    backgroundColor: COLORS.BORDER_GRAY,
  },
  buttonText: {
    color: COLORS.BLACK,
  },
})

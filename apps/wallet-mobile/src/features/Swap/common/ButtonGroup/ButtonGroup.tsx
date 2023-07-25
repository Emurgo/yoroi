import React, {useState} from 'react'
import {GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {COLORS} from '../../../../theme'

interface ButtonGroupProps {
  buttons: string[]
  onButtonPress: (event: GestureResponderEvent, id: number) => void
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({buttons, onButtonPress}) => {
  const [clickedId, setClickedId] = useState(0)

  const handleClick = (event: GestureResponderEvent, id: number) => {
    setClickedId(id)
    onButtonPress(event, id)
  }

  return (
    <View style={styles.container}>
      {buttons.map((buttonLabel, i) => (
        <View key={i} style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={(event) => handleClick(event, i)}
            style={[styles.customButton, i === clickedId && styles.activeButton]}
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

export default ButtonGroup

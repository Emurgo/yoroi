import React, {useState} from 'react'
import {GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

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
        <TouchableOpacity
          key={i}
          onPress={(event) => handleClick(event, i)}
          style={[styles.customButton, i === clickedId && styles.activeButton]}
        >
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  customButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeButton: {
    backgroundColor: '#DCE0E9',
  },
  buttonText: {
    color: '#000',
  },
})

export default ButtonGroup

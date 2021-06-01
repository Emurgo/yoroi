// @flow
import React, {useState} from 'react'
import {Image, View, TouchableHighlight} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'

import utfSymbols from '../../utils/utfSymbols'
import {Text} from '../UiKit'
import backspaceIcon from '../../assets/img/backspace.png'

import styles from './styles/PinInputKeyboard.style'

const BACKSPACE = utfSymbols.ERASE_TO_LEFT

const keyboard = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', BACKSPACE],
]

const processPin = (pin, setPin, pinMaxLength, keyDown) => {
  if (keyDown === BACKSPACE) {
    setPin(pin.substring(0, pin.length - 1))
  } else if (pin.length === pinMaxLength) {
    return
  } else {
    const newPin = pin.concat(keyDown)
    setPin(newPin)
  }
}

const KeyboardKey = ({value, onKeyDown}) => {
  const isEmpty = value === ''
  const isBackspace = value === BACKSPACE
  const isDigit = !isEmpty && !isBackspace

  return (
    <TouchableHighlight
      style={[styles.keyboardKey, !isDigit && styles.keyboardKeyDisabled]}
      onPress={() => onKeyDown(value)}
      underlayColor="#bbbbbb"
      disabled={isEmpty}
      testID={`pinKey${value}`}
    >
      {isBackspace ? (
        <Image source={backspaceIcon} />
      ) : (
        <Text style={styles.keyboardKeyText}>{value}</Text>
      )}
    </TouchableHighlight>
  )
}

type Props = {
  onPinChange: (string) => void,
  pinLength: number,
}

const PinInputKeyboard = ({onPinChange, pinLength}: Props) => {
  const [pin, setPin] = useState('')

  const updatePin = (newPin) => {
    onPinChange(newPin)
    setPin(newPin)
  }

  return (
    <SafeAreaView style={styles.keyboardSafeAreaView}>
      <View style={styles.keyboard}>
        {keyboard.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyboardRow}>
            {row.map((value, index) => (
              <KeyboardKey
                key={index}
                value={value}
                onKeyDown={(value) => {
                  processPin(pin, updatePin, pinLength, value)
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  )
}

export default PinInputKeyboard

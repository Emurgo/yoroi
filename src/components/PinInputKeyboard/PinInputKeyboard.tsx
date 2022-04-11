import React, {useState} from 'react'
import {Image, StyleSheet, TouchableHighlight, View} from 'react-native'

import backspaceIcon from '../../assets/img/backspace.png'
import utfSymbols from '../../legacy/utfSymbols'
import {Text} from '../Text'

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

type KeyboardKeyProps = {
  value: string
  onKeyDown: (value: string) => void
}
const KeyboardKey = ({value, onKeyDown}: KeyboardKeyProps) => {
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
      {isBackspace ? <Image source={backspaceIcon} /> : <Text style={styles.keyboardKeyText}>{value}</Text>}
    </TouchableHighlight>
  )
}

type Props = {
  onPinChange: (string) => Promise<void> | void
  pinLength: number
}

export const PinInputKeyboard = ({onPinChange, pinLength}: Props) => {
  const [pin, setPin] = useState('')

  const updatePin = async (newPin) => {
    await onPinChange(newPin)
    setPin(newPin)
  }

  return (
    <View style={styles.keyboard}>
      <Row>
        {keyboard[0].map((value) => (
          <KeyboardKey key={value} value={value} onKeyDown={(value) => processPin(pin, updatePin, pinLength, value)} />
        ))}
      </Row>

      <Row>
        {keyboard[1].map((value) => (
          <KeyboardKey key={value} value={value} onKeyDown={(value) => processPin(pin, updatePin, pinLength, value)} />
        ))}
      </Row>

      <Row>
        {keyboard[2].map((value) => (
          <KeyboardKey key={value} value={value} onKeyDown={(value) => processPin(pin, updatePin, pinLength, value)} />
        ))}
      </Row>

      <Row>
        {keyboard[3].map((value) => (
          <KeyboardKey key={value} value={value} onKeyDown={(value) => processPin(pin, updatePin, pinLength, value)} />
        ))}
      </Row>
    </View>
  )
}

const Row = (props) => <View {...props} style={styles.keyboardRow} />

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardRow: {
    flex: 1,
    flexDirection: 'row',
  },
  keyboardKey: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 2 * StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: '#B7B7B7',
  },
  keyboardKeyDisabled: {
    backgroundColor: '#D8D8D8',
  },
  keyboardKeyText: {
    fontSize: 30,
    lineHeight: 35,
    textAlign: 'center',
  },
})

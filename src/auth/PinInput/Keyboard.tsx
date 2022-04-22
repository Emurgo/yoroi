import React from 'react'
import {Image, TouchableHighlight, View} from 'react-native'
import {StyleSheet} from 'react-native'

import backspaceIcon from '../../assets/img/backspace.png'
import {Text} from '../../components/Text'
import utfSymbols from '../../legacy/utfSymbols'

export const Keyboard = ({onKeyDown}: {onKeyDown: (key: string) => void}) => {
  return (
    <View style={styles.keyboardSafeAreaView}>
      <View style={styles.keyboard}>
        {keyboard.map((row) => (
          <View key={row[0]} style={styles.keyboardRow}>
            {row.map((value) => (
              <KeyboardKey key={value} value={value} onPress={onKeyDown} />
            ))}
          </View>
        ))}
      </View>
    </View>
  )
}

type KeyboardKeyProps = {
  value: string
  onPress: (value: string) => void
}
const KeyboardKey = ({value, onPress}: KeyboardKeyProps) => {
  const isEmpty = value === ''
  const isBackspace = value === BACKSPACE
  const isDigit = !isEmpty && !isBackspace

  return (
    <TouchableHighlight
      style={[styles.keyboardKey, !isDigit && styles.keyboardKeyDisabled]}
      onPress={() => onPress(value)}
      underlayColor="#bbbbbb"
      disabled={isEmpty}
      testID={`pinKey${value}`}
    >
      {isBackspace ? <Image source={backspaceIcon} /> : <Text style={styles.keyboardKeyText}>{value}</Text>}
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  keyboardSafeAreaView: {
    width: '100%',
    backgroundColor: '#D8D8D8',
  },
  keyboard: {
    height: 250,
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

export const BACKSPACE = utfSymbols.ERASE_TO_LEFT

const keyboard = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', BACKSPACE],
]

/* eslint-disable react/jsx-newline */
import React from 'react'
import {Image, StyleSheet, TouchableHighlight, View, ViewProps} from 'react-native'

import backspaceIcon from '../assets/img/backspace.png'
import {Text} from './Text'

export const BACKSPACE = 'BACKSPACE'

export const NumericKeyboard = ({onKeyDown}: {onKeyDown: (key: string) => void}) => {
  return (
    <View style={styles.keyboard}>
      <Row>
        <Key value="1" onPress={onKeyDown} />
        <Key value="2" onPress={onKeyDown} />
        <Key value="3" onPress={onKeyDown} />
      </Row>

      <Row>
        <Key value="4" onPress={onKeyDown} />
        <Key value="5" onPress={onKeyDown} />
        <Key value="6" onPress={onKeyDown} />
      </Row>

      <Row>
        <Key value="7" onPress={onKeyDown} />
        <Key value="8" onPress={onKeyDown} />
        <Key value="9" onPress={onKeyDown} />
      </Row>

      <Row>
        <EmptyKey />
        <Key value="0" onPress={onKeyDown} />
        <BackspaceKey onPress={onKeyDown} />
      </Row>
    </View>
  )
}

type KeyboardKeyProps = {
  value: string
  onPress: (value: string) => void
}
const Key = ({value, onPress}: KeyboardKeyProps) => {
  const isEmpty = value === ''
  const isDigit = !isEmpty

  return (
    <TouchableHighlight
      style={[styles.keyboardKey, !isDigit && styles.keyboardKeyDisabled]}
      onPress={() => onPress(value)}
      underlayColor="#bbbbbb"
      disabled={isEmpty}
      testID={`pinKey${value}`}
    >
      <Text style={styles.keyboardKeyText}>{value}</Text>
    </TouchableHighlight>
  )
}

const EmptyKey = () => {
  return <View style={[styles.keyboardKey, styles.keyboardKeyDisabled]} testID="pinKeyEmpty" />
}

const BackspaceKey = ({onPress}: {onPress: (value: string) => void}) => (
  <TouchableHighlight
    style={[styles.keyboardKey, styles.keyboardKeyDisabled]}
    onPress={() => onPress('BACKSPACE')}
    underlayColor="#bbbbbb"
    testID="pinKeyBACKSPACE"
  >
    <Image source={backspaceIcon} />
  </TouchableHighlight>
)

const Row = (props: ViewProps) => <View {...props} style={styles.keyboardRow} />

const styles = StyleSheet.create({
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

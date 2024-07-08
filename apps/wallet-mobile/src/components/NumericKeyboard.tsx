import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, TouchableHighlight, View, ViewProps} from 'react-native'

import {Backspace} from './Icon/Backspace'
import {Spacer} from './Spacer'
import {Text} from './Text'

export const BACKSPACE = 'BACKSPACE'

export const NumericKeyboard = ({onKeyDown}: {onKeyDown: (key: string) => void}) => {
  const {styles} = useStyles()
  return (
    <View style={styles.keyboard}>
      <Row>
        <Key value="1" onPress={onKeyDown} />

        <Spacer width={5} />

        <Key value="2" onPress={onKeyDown} />

        <Spacer width={5} />

        <Key value="3" onPress={onKeyDown} />
      </Row>

      <Spacer height={7} />

      <Row>
        <Key value="4" onPress={onKeyDown} />

        <Spacer width={5} />

        <Key value="5" onPress={onKeyDown} />

        <Spacer width={5} />

        <Key value="6" onPress={onKeyDown} />
      </Row>

      <Spacer height={7} />

      <Row>
        <Key value="7" onPress={onKeyDown} />

        <Spacer width={5} />

        <Key value="8" onPress={onKeyDown} />

        <Spacer width={5} />

        <Key value="9" onPress={onKeyDown} />
      </Row>

      <Spacer height={7} />

      <Row>
        <EmptyKey />

        <Spacer width={5} />

        <Key value="0" onPress={onKeyDown} />

        <Spacer width={5} />

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
  const {styles} = useStyles()
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
  const {styles} = useStyles()
  return <View style={styles.emptyKey} testID="pinKeyEmpty" />
}

const BackspaceKey = ({onPress}: {onPress: (value: string) => void}) => {
  const {styles, color} = useStyles()
  return (
    <TouchableHighlight
      style={styles.backspaceKey}
      onPress={() => onPress('BACKSPACE')}
      underlayColor="#bbbbbb"
      testID="pinKeyBACKSPACE"
    >
      <Backspace color={color.gray_cmax} />
    </TouchableHighlight>
  )
}

const Row = (props: ViewProps) => {
  const {styles} = useStyles()
  return <View {...props} style={styles.keyboardRow} />
}

const useStyles = () => {
  const {color, isDark} = useTheme()

  const styles = StyleSheet.create({
    keyboard: {
      height: 290,
      padding: 5,
      backgroundColor: isDark ? '#222324' : '#D1D5DB',
    },
    keyboardRow: {
      flex: 1,
      maxHeight: 50,
      flexDirection: 'row',
    },
    keyboardKey: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: 3 * StyleSheet.hairlineWidth,
      borderColor: 'rgba(0, 0, 0, 0.30)',
      borderRadius: 5,
      backgroundColor: isDark ? '#6B6B6B' : color.white_static,
    },
    keyboardKeyText: {
      fontSize: 30,
      lineHeight: 35,
      textAlign: 'center',
    },
    backspaceKey: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 5,
    },
    keyboardKeyDisabled: {
      backgroundColor: color.gray_c100,
    },
    emptyKey: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 5,
    },
  })

  return {styles, color}
}

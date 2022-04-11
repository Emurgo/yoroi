import _ from 'lodash'
import React from 'react'
import {Image, TouchableHighlight, View} from 'react-native'
import {StyleSheet} from 'react-native'

import backspaceIcon from '../../assets/img/backspace.png'
import utfSymbols from '../../legacy/utfSymbols'
import {COLORS} from '../../theme'
import {Text} from '../Text'

export type PinInputLabels = {
  title: string
  subtitle?: string
  subtitle2?: string
}

type Props = {
  labels: PinInputLabels
  onPinEnter: (pin: string) => Promise<boolean>
  pinMaxLength: number
}

export const PinInput = ({pinMaxLength, labels, onPinEnter}: Props) => {
  const [pin, setPin] = React.useState('')
  const onKeyDown = (value) => processPin(pin, setPin, pinMaxLength, value, onPinEnter)

  return (
    <View style={styles.root}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{labels.title}</Text>

        <Text style={styles.subtitle}>{labels.subtitle == null ? null : labels.subtitle}</Text>
        <Text style={styles.subtitle}>{labels.subtitle2 == null ? null : labels.subtitle2}</Text>

        <View style={styles.pinContainer}>
          {_.range(0, pinMaxLength).map((index) => (
            <PinPlaceholder key={index} isActive={index < pin.length} />
          ))}
        </View>
      </View>

      <Keyboard onKeyDown={onKeyDown} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_BLUE,
  },
  infoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 23,
    lineHeight: 25,
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    marginVertical: 5,
    maxWidth: '60%',
    minHeight: 30,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: 12,
    height: 12,
    borderRadius: 10,
    marginHorizontal: 15,
    backgroundColor: 'white',
  },
  pinInactive: {
    opacity: 0.5,
  },
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

const BACKSPACE = utfSymbols.ERASE_TO_LEFT

const keyboard = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', BACKSPACE],
]

const processPin = async (pin, setPin, pinMaxLength, keyDown, onPinEnter) => {
  if (pin.length === pinMaxLength) {
    return
  }

  if (keyDown === BACKSPACE) {
    setPin(pin.substring(0, pin.length - 1))
  } else {
    const newPin = pin.concat(keyDown)
    setPin(newPin)

    if (newPin.length === pinMaxLength) {
      const shouldResetInput = await onPinEnter(newPin)

      if (shouldResetInput) {
        setPin('')
      }
    }
  }
}

type PinPlaceholderProps = {
  isActive: boolean
}
const PinPlaceholder = ({isActive}: PinPlaceholderProps) => (
  <View style={[styles.pin, !isActive && styles.pinInactive]} />
)

const Keyboard = ({onKeyDown}: {onKeyDown: (key: string) => void}) => {
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

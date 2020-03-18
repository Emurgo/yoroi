// @flow
import React from 'react'
import {compose} from 'redux'
import _ from 'lodash'
import {Image, View, TouchableHighlight} from 'react-native'
import {withStateHandlers, withHandlers} from 'recompose'
import {SafeAreaView} from 'react-navigation'

import utfSymbols from '../../utils/utfSymbols'
import {Text, ScreenBackground} from '../UiKit'
import backspaceIcon from '../../assets/img/backspace.png'

import styles from './styles/PinInput.style'

import type {ComponentType} from 'react'

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

const PinPlaceholder = ({isActive}) => (
  <View style={[styles.pin, !isActive && styles.pinInactive]} />
)

const KeyboardKey = ({value, onKeyDown}) => {
  const isEmpty = value === ''
  const isBackspace = value === BACKSPACE
  const isDigit = !isEmpty && !isBackspace

  return (
    <TouchableHighlight
      style={[styles.keyboardKey, !isDigit && styles.keyboardKeyDisabled]}
      onPress={onKeyDown}
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

const EnhancedKeyboardKey = withHandlers({
  onKeyDown: ({value, onPress}) => () => onPress(value),
})(KeyboardKey)

export type PinInputLabels = {
  title: string,
  subtitle?: string,
  subtitle2?: string,
}

type ExternalProps = {
  labels: PinInputLabels,
  onPinEnter: (string) => Promise<boolean>,
  pinMaxLength: number,
}

const PinInput = ({
  pin,
  setPin,
  pinMaxLength,
  labels,
  onKeyDown,
  onPinEnter,
}) => (
  <ScreenBackground style={styles.root}>
    <View style={styles.infoContainer}>
      <Text style={styles.title}>{labels.title}</Text>

      <Text style={styles.subtitle}>
        {labels.subtitle == null ? null : labels.subtitle}
      </Text>
      <Text style={styles.subtitle}>
        {labels.subtitle2 == null ? null : labels.subtitle2}
      </Text>

      <View style={styles.pinContainer}>
        {_.range(0, pinMaxLength).map((index) => (
          <PinPlaceholder key={index} isActive={index < pin.length} />
        ))}
      </View>
    </View>

    <SafeAreaView style={styles.keyboardSafeAreaView}>
      <View style={styles.keyboard}>
        {keyboard.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyboardRow}>
            {row.map((value, index) => (
              <EnhancedKeyboardKey
                key={index}
                value={value}
                onPress={onKeyDown}
              />
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  </ScreenBackground>
)

export default (compose(
  withStateHandlers(
    {
      pin: '',
    },
    {
      setPin: (state) => (value) => ({pin: value}),
    },
  ),
  withHandlers({
    onKeyDown: ({pin, setPin, pinMaxLength, onPinEnter}) => (value) =>
      processPin(pin, setPin, pinMaxLength, value, onPinEnter),
  }),
)(PinInput): ComponentType<ExternalProps>)

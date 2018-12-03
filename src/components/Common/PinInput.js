import React from 'react'
import {compose} from 'redux'
import _ from 'lodash'
import {View, TouchableHighlight} from 'react-native'
import {withStateHandlers, withHandlers} from 'recompose'
import {SafeAreaView} from 'react-navigation'

import Text from '../../components/UiKit/Text'

import styles from './styles/PinInput.style'

const BACKSPACE = '⌫'
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
  <View style={isActive ? styles.pinActive : styles.pinInactive} />
)

const KeyboardKey = ({value, onKeyDown}) => {
  const isDisabled = value === ''

  return (
    <TouchableHighlight
      style={[styles.keyboardKey, isDisabled && styles.keyboardKeyDisabled]}
      onPress={onKeyDown}
      underlayColor="#e8e8e8"
      disabled={isDisabled}
    >
      <Text style={styles.keyboardKeyText}>{value}</Text>
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

type Props = {
  pin: string,
  setPin: (string) => void,
  pinMaxLength: number,
  labels: PinInputLabels,
  onKeyDown: (string) => void,
  onPinEnter: (string) => Promise<boolean>,
}

const PinInput = ({
  pin,
  setPin,
  pinMaxLength,
  labels,
  onKeyDown,
  onPinEnter,
}: Props) => (
  <View style={styles.root}>
    <View style={styles.titleContainer}>
      <Text style={styles.title}>{labels.title}</Text>
    </View>

    <View style={styles.pinContainer}>
      {_.range(0, pinMaxLength).map((index) => (
        <PinPlaceholder key={index} isActive={index < pin.length} />
      ))}
    </View>

    <View style={styles.subtitleContainer}>
      <Text style={styles.subtitle}>{labels.subtitle}</Text>
      <Text style={styles.subtitle}>{labels.subtitle2}</Text>
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
  </View>
)

export default compose(
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
)(PinInput)

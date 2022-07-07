import _ from 'lodash'
import React from 'react'
import {View} from 'react-native'
import {StyleSheet} from 'react-native'

import {Spacer} from '../../components/Spacer'
import {Text} from '../../components/Text'
import {lightPalette} from '../../theme'
import {BACKSPACE, Keyboard} from './Keyboard'

type Props = {
  title?: string
  subtitles?: Array<string>
  onDone: (pin: string) => void
  pinMaxLength: number
  enabled?: boolean
}

export const PinInput = ({enabled = true, pinMaxLength, title, subtitles = [], onDone}: Props) => {
  const [pin, setPin] = React.useState('')

  const onKeyDown = (value: string) => {
    if (!enabled) return
    if (value === BACKSPACE) {
      setPin(pin.substring(0, pin.length - 1))
      return
    }

    if (pin.length === pinMaxLength) {
      return
    }

    const newPin = pin.concat(value)
    setPin(newPin)
    if (newPin.length === pinMaxLength) onDone(newPin)
  }

  return (
    <View style={styles.pinInput}>
      <View style={styles.info}>
        <Text style={{fontFamily: 'Rubik-Medium', fontSize: 20, lineHeight: 30, color: lightPalette.gray['max']}}>
          {title}
        </Text>

        <Spacer height={4} />

        {subtitles.map((subtitle) => (
          <Text
            key={subtitle}
            style={{fontFamily: 'Rubik-Regular', fontSize: 14, lineHeight: 22, color: lightPalette.gray['600']}}
          >
            {subtitle == null ? null : subtitle}
          </Text>
        ))}

        <Spacer height={24} />

        <View style={styles.pins}>
          {_.range(0, pinMaxLength).map((index) => (
            <PinPlaceholder key={index} isActive={index < pin.length} />
          ))}
        </View>
      </View>

      <Keyboard onKeyDown={onKeyDown} />
    </View>
  )
}

type PinPlaceholderProps = {
  isActive: boolean
}

const PinPlaceholder = ({isActive}: PinPlaceholderProps) => (
  <View style={styles.pin}>
    <View style={[styles.pinCircle, isActive ? styles.pinCircleActive : styles.pinCircleInactive]} />
  </View>
)

const styles = StyleSheet.create({
  pinInput: {
    flex: 1,
    backgroundColor: 'white',
  },
  info: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pins: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    paddingHorizontal: 8,
  },
  pinCircle: {
    width: 16,
    height: 16,
    borderRadius: 10,
  },
  pinCircleInactive: {
    borderWidth: 2,
    borderColor: '#3154CB',
  },
  pinCircleActive: {
    backgroundColor: '#3154CB',
  },
})

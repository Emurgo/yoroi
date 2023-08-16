import _ from 'lodash'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {BACKSPACE, NumericKeyboard} from '../../components/NumericKeyboard'
import {Spacer} from '../../components/Spacer'
import {Text} from '../../components/Text'
import {lightPalette} from '../../theme'

type Props = {
  title?: string
  subtitles?: Array<string>
  onDone: (pin: string) => void
  pinMaxLength: number
  enabled?: boolean
  onGoBack?: () => void
}

export type PinInputRef = {
  clear: () => void
}

export const PinInput = React.forwardRef<PinInputRef, Props>((props, ref) => {
  const {enabled = true, pinMaxLength, title, subtitles = [], onDone, onGoBack} = props

  const [pin, setPin] = React.useState('')

  React.useImperativeHandle(ref, () => ({
    clear: () => {
      setPin('')
    },
  }))

  const onKeyDown = (value: string) => {
    if (!enabled) return
    if (value === BACKSPACE) {
      if (pin.length === 0) onGoBack?.()
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
        <Text style={styles.title}>{title}</Text>

        <Spacer height={4} />

        {subtitles.map((subtitle) => (
          <Text key={subtitle} style={styles.subtitle}>
            {subtitle == null ? null : subtitle}
          </Text>
        ))}

        <Spacer height={24} />

        <View style={styles.pinContainer}>
          {_.range(0, pinMaxLength).map((index) => (
            <PinPlaceholder key={index} isActive={index < pin.length} />
          ))}
        </View>
      </View>

      <NumericKeyboard onKeyDown={onKeyDown} />
    </View>
  )
})

type PinPlaceholderProps = {
  isActive: boolean
}

const PinPlaceholder = ({isActive}: PinPlaceholderProps) => (
  <View style={styles.pinElement}>
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
  title: {
    fontFamily: 'Rubik-Medium',
    fontSize: 20,
    lineHeight: 30,
    color: lightPalette.gray['max'],
  },
  subtitle: {
    fontFamily: 'Rubik-Regular',
    fontSize: 14,
    lineHeight: 22,
    color: lightPalette.gray['600'],
    maxWidth: 320,
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinElement: {
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

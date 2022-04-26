import _ from 'lodash'
import React from 'react'
import {View} from 'react-native'
import {StyleSheet} from 'react-native'

import {Spacer} from '../../components/Spacer'
import {Text} from '../../components/Text'
import {COLORS} from '../../theme'
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
    <View style={styles.root}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{title}</Text>

        {subtitles.map((subtitle) => (
          <Text key={subtitle} style={styles.subtitle}>
            {subtitle == null ? null : subtitle}
          </Text>
        ))}

        <Spacer height={16} />

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
})

type PinPlaceholderProps = {
  isActive: boolean
}
const PinPlaceholder = ({isActive}: PinPlaceholderProps) => (
  <View style={[styles.pin, !isActive && styles.pinInactive]} />
)

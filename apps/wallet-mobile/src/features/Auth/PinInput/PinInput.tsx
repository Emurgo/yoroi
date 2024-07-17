import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {BACKSPACE, NumericKeyboard} from '../../../components/NumericKeyboard'
import {Spacer} from '../../../components/Spacer'
import {Text} from '../../../components/Text'

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
  const styles = useStyles()

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

const PinPlaceholder = ({isActive}: PinPlaceholderProps) => {
  const styles = useStyles()
  return (
    <View style={styles.pinElement}>
      <View style={[styles.pinCircle, isActive ? styles.pinCircleActive : styles.pinCircleInactive]} />
    </View>
  )
}

const useStyles = () => {
  const {color} = useTheme()

  const styles = StyleSheet.create({
    pinInput: {
      flex: 1,
      backgroundColor: color.bg_color_high,
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
      color: color.gray_cmax,
    },
    subtitle: {
      fontFamily: 'Rubik-Regular',
      fontSize: 14,
      lineHeight: 22,
      color: color.gray_c600,
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
      borderColor: color.primary_c600,
    },
    pinCircleActive: {
      backgroundColor: color.primary_c600,
    },
  })
  return styles
}

import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
import React, {useEffect, useRef} from 'react'
import {StyleSheet, TextInput, View} from 'react-native'

import {Spacer} from '../../../components/Spacer/Spacer'
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
  focus: () => void
}

export const PinInput = React.forwardRef<PinInputRef, Props>((props, ref) => {
  const {enabled = true, pinMaxLength, title, subtitles = [], onDone} = props
  const styles = useStyles()

  const [pin, setPin] = React.useState('')
  const inputRef = useRef<TextInput>(null)
  const {isDark} = useTheme()

  // Auto-focus the hidden TextInput to trigger native keyboard
  useEffect(() => {
    if (enabled) {
      inputRef.current?.focus()
    }
  }, [enabled])

  // Expose the clear function via ref
  React.useImperativeHandle(ref, () => ({
    clear: () => {
      setPin('')
      inputRef.current?.clear()
      inputRef.current?.focus()
    },
    focus: () => {
      inputRef.current?.focus()
    },
  }))

  const handleTextChange = (value: string) => {
    if (!enabled) return

    // Limit pin input to pinMaxLength
    if (value.length > pinMaxLength) {
      value = value.substring(0, pinMaxLength)
    }

    setPin(value)

    // Call onDone when pin is complete
    if (value.length === pinMaxLength) {
      onDone(value)
    }
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
          {/* Pin Placeholder Circles */}
          {_.range(0, pinMaxLength).map((index) => (
            <PinPlaceholder key={index} isActive={index < pin.length} />
          ))}
        </View>
      </View>

      {/* Hidden TextInput for triggering the native keyboard */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        keyboardType="numeric"
        value={pin}
        onChangeText={handleTextChange}
        maxLength={pinMaxLength}
        autoFocus={true}
        caretHidden={true}
        importantForAccessibility="no"
        keyboardAppearance={isDark ? 'dark' : 'light'}
      />
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
      backgroundColor: color.bg_color_max,
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
      color: color.gray_max,
    },
    subtitle: {
      fontFamily: 'Rubik-Regular',
      fontSize: 14,
      lineHeight: 22,
      color: color.gray_600,
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
      borderColor: color.primary_600,
    },
    pinCircleActive: {
      backgroundColor: color.primary_600,
    },
    hiddenInput: {
      position: 'absolute',
      opacity: 0,
      height: 0,
      width: 0,
    },
  })
  return styles
}

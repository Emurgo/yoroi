import {atoms as a, space as s, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native'

import {Space} from '~/ui/Space/Space'

type Props = {
  title?: string
  enabled?: boolean
  subtitles?: Array<string>
  pinMaxLength: number
  onGoBack?: () => unknown
  onDone: (pin: string) => unknown
}

export type PinInputRef = {
  clear: () => void
}

export const PinInput = React.forwardRef<PinInputRef, Props>((props, ref) => {
  const {enabled = true, pinMaxLength, title, subtitles = [], onDone} = props
  const {atoms: ta} = useTheme()
  const [pin, setPin] = React.useState('')
  const inputRef = React.useRef<TextInput | null>(null)

  React.useImperativeHandle(ref, () => ({
    clear: () => {
      setPin('')
    },
  }))

  const handleFocus = React.useCallback(() => {
    if (inputRef.current) {
      if (Platform.OS === 'android') {
        inputRef.current.blur()
        setTimeout(() => {
          inputRef.current?.focus()
        }, 50)
      } else {
        inputRef.current.focus()
      }
    }
  }, [])

  return (
    <KeyboardAvoidingView
      style={[a.flex_1, ta.bg_color_max]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <Pressable style={[a.flex_1]} onPress={handleFocus}>
        <View style={[a.flex_1, a.align_center, a.justify_center]}>
          <Text
            style={[
              a.body_1_lg_medium,
              ta.text_gray_max,
              {fontSize: 20, lineHeight: 30},
            ]}
          >
            {title}
          </Text>

          <Space.Height.sm />

          {subtitles.map((subtitle) => (
            <Text
              key={subtitle}
              style={[
                a.body_2_md_regular,
                ta.text_gray_medium,
                a.text_center,
                {
                  fontSize: 14,
                  lineHeight: 22,
                  maxWidth: 320,
                },
              ]}
            >
              {subtitle == null ? null : subtitle}
            </Text>
          ))}

          <Space.Height._2xl />

          <View style={[a.flex_row, a.gap_sm]}>
            {Array.from({length: pinMaxLength}, (_, index) => (
              <PinPlaceholder key={index} isActive={index < pin.length} />
            ))}
          </View>
        </View>

        <TextInput
          ref={inputRef}
          value={pin}
          onChangeText={(value) => {
            if (!enabled) return
            if (value.length <= pinMaxLength) {
              setPin(value)
              if (value.length === pinMaxLength) onDone(value)
            }
          }}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={pinMaxLength}
          style={[{opacity: 0, width: 1, height: 1}, a.absolute]}
          placeholder=""
          autoFocus
          blurOnSubmit={false}
          onSubmitEditing={() => {}}
          editable
          selectTextOnFocus={false}
        />
      </Pressable>
    </KeyboardAvoidingView>
  )
})

const PinPlaceholder = ({isActive}: {isActive: boolean}) => {
  const {palette: p} = useTheme()
  return (
    <View style={[a.px_sm]}>
      <View
        style={[
          a.rounded_full,
          {width: s.lg, height: s.lg},
          isActive
            ? {backgroundColor: p.primary_600}
            : {borderWidth: 2, borderColor: p.primary_600},
        ]}
      />
    </View>
  )
}

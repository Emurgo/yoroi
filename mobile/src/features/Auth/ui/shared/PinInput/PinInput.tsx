import {atoms as a, space as s, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {BACKSPACE, NumericKeyboard} from '~/ui/NumericKeyboard'
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
  const {
    enabled = true,
    pinMaxLength,
    title,
    subtitles = [],
    onDone,
    onGoBack,
  } = props
  const {atoms: ta} = useTheme()
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
    <View style={[a.flex_1, ta.bg_color_max]}>
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

      <NumericKeyboard onKeyDown={onKeyDown} />
    </View>
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

import {atoms as a, useTheme} from '@yoroi/theme'
import _ from 'lodash'
import React from 'react'
import {Text, View} from 'react-native'

import {BACKSPACE, NumericKeyboard} from '../../../components/NumericKeyboard'
import {Spacer} from '../../../components/Spacer/Spacer'

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
  const {
    enabled = true,
    pinMaxLength,
    title,
    subtitles = [],
    onDone,
    onGoBack,
  } = props
  const {atoms: ta, palette: p} = useTheme()

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

        <Spacer height={4} />

        {subtitles.map((subtitle) => (
          <Text
            key={subtitle}
            style={[
              a.body_2_md_regular,
              ta.text_gray_max,
              {
                fontSize: 14,
                lineHeight: 22,
                maxWidth: 320,
                textAlign: 'center',
              },
            ]}
          >
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

const PinPlaceholder = ({isActive}: {isActive: boolean}) => {
  const {atoms: ta, palette: p} = useTheme()
  return (
    <View
      style={[
        a.p_md,
        a.rounded_md,
        {borderWidth: 2, borderColor: p.primary_600},
      ]}
    >
      <View
        style={[
          {width: 4, height: 4},
          a.rounded_sm,
          isActive
            ? {backgroundColor: p.primary_600}
            : {borderWidth: 2, borderColor: p.primary_600},
        ]}
      />
    </View>
  )
}

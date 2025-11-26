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

  // Call onDone when PIN reaches max length (deferred to avoid state update during render)
  React.useEffect(() => {
    if (pin.length === pinMaxLength) {
      // Use startTransition to defer the callback and avoid state update during render
      React.startTransition(() => {
        onDone(pin)
      })
    }
  }, [pin, pinMaxLength, onDone])

  const onKeyDown = React.useCallback(
    (value: string) => {
      if (!enabled) return

      if (value === BACKSPACE) {
        setPin((prevPin) => {
          if (prevPin.length === 0) {
            // Defer onGoBack to avoid state update during render
            React.startTransition(() => {
              onGoBack?.()
            })
            return prevPin
          }
          return prevPin.slice(0, -1)
        })
        return
      }

      setPin((prevPin) => {
        if (prevPin.length === pinMaxLength) {
          return prevPin
        }
        return `${prevPin}${value}`
      })
    },
    [enabled, pinMaxLength, onGoBack],
  )

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
          {React.useMemo(
            () =>
              Array.from({length: pinMaxLength}, (_, index) => index).map(
                (index) => (
                  <PinPlaceholder key={index} isActive={index < pin.length} />
                ),
              ),
            [pinMaxLength, pin.length],
          )}
        </View>
      </View>

      <NumericKeyboard onKeyDown={onKeyDown} />
    </View>
  )
})

const PinPlaceholder = React.memo(({isActive}: {isActive: boolean}) => {
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
})

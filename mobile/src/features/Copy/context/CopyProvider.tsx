import {invalid, time} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as Clipboard from 'expo-clipboard'
import * as React from 'react'
import {GestureResponderEvent, Text, useWindowDimensions} from 'react-native'
import Animated, {
  FadeInDown,
  FadeOutDown,
  FadingTransition,
} from 'react-native-reanimated'

type CopyProps = {
  text: string
  feedback?: string
  event?: GestureResponderEvent
}

type ClipboardContext = {
  copy: (props: CopyProps) => Promise<void>
  isCopying: boolean
}

const ClipboardContext = React.createContext<ClipboardContext | undefined>(
  undefined,
)

type CopiedState = {
  feedback: string
  locationX: number
  locationY: number
}

const feedbackTimeout = time.seconds(1.5)

// TODO: replace by a tooltip library, it only shows on top and goes off screen
const CopyFeedback = React.memo(({copied}: {copied: CopiedState}) => {
  const {atoms: ta} = useTheme()

  return (
    <Animated.View
      layout={FadingTransition}
      entering={FadeInDown}
      exiting={FadeOutDown}
      style={[
        a.absolute,
        ta.bg_color_min,
        a.align_center,
        a.justify_center,
        a.rounded_sm,
        a.z_10,
        {top: copied.locationY, left: copied.locationX},
      ]}
    >
      <Text
        style={[a.align_center, a.p_sm, a.body_2_md_medium, ta.text_gray_max]}
      >
        {copied.feedback}
      </Text>
    </Animated.View>
  )
})

export const CopyProvider = React.memo(
  ({children}: React.PropsWithChildren) => {
    const {height, width} = useWindowDimensions()
    const [copied, setCopied] = React.useState<CopiedState | null>(null)
    const [isCopying, setIsCopying] = React.useState(false)

    const copy = React.useCallback(
      async ({text, feedback = 'Copied', event}: CopyProps) => {
        // Persist event data before using it
        // event.persist() would be too much here to handle the clean up
        const eventData = event
          ? {
              pageX: event.nativeEvent.pageX,
              pageY: event.nativeEvent.pageY,
            }
          : null

        const baseLocationX =
          (eventData?.pageX ?? width * 0.5) - feedback.length * 4
        const maxX = width - 20 - feedback.length * 8
        const minX = 20 + feedback.length * 8
        const locationX = Math.min(Math.max(baseLocationX, minX), maxX)

        await Clipboard.setStringAsync(text)
        setCopied({
          feedback,
          locationY: eventData ? eventData.pageY - 50 : height * 0.85,
          locationX,
        })
        setIsCopying(true)

        const timeout = setTimeout(() => {
          setCopied(null)
          setIsCopying(false)
          clearTimeout(timeout)
        }, feedbackTimeout)
      },
      [height, width],
    )

    const value = React.useMemo(
      () => ({
        copy,
        isCopying,
      }),
      [copy, isCopying],
    )

    return (
      <ClipboardContext.Provider value={value}>
        {children}
        {copied && <CopyFeedback copied={copied} />}
      </ClipboardContext.Provider>
    )
  },
)

export const useCopy = () =>
  React.useContext(ClipboardContext) ??
  invalid('useCopy must be used within a CopyProvider')

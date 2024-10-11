import Clipboard from '@react-native-community/clipboard'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {GestureResponderEvent, StyleSheet, useWindowDimensions} from 'react-native'
import Animated, {FadeInDown, FadeOutDown, Layout} from 'react-native-reanimated'

import {Text} from '../Text'

const ClipboardContext = React.createContext<undefined | ClipboardContext>(undefined)

type Props = {
  children: React.ReactNode
}

type CopiedState = {
  feedback: string
  locationX: number
  locationY: number
}

const FEEDBACK_TIMEOUT = 1500

export const ClipboardProvider = ({children}: Props) => {
  const styles = useStyles()
  const [copied, setCopied] = React.useState<CopiedState | null>(null)
  const {height, width} = useWindowDimensions()
  const copy: ClipboardContext['copy'] = ({text, feedback = 'Copied', event}) => {
    Clipboard.setString(text)
    setCopied({
      feedback,
      locationY: event ? event.nativeEvent.pageY - 50 : height * 0.85,
      locationX: (event?.nativeEvent.pageX ?? width * 0.5) - feedback.length * 4,
    })
    setTimeout(() => setCopied(null), FEEDBACK_TIMEOUT)
  }

  return (
    <ClipboardContext.Provider value={{copy}}>
      <>
        {children}

        {copied && (
          <Animated.View
            layout={Layout}
            entering={FadeInDown}
            exiting={FadeOutDown}
            style={[styles.isCopying, {top: copied.locationY, left: copied.locationX}]}
          >
            <Text style={styles.textCopy}>{copied.feedback}</Text>
          </Animated.View>
        )}
      </>
    </ClipboardContext.Provider>
  )
}

export const useCopy = () => {
  const {copy: globalCopy} = React.useContext(ClipboardContext) ?? {copy: () => null}
  const [isCopying, setIsCopying] = React.useState(false)
  const copy = (props: CopyProps) => {
    globalCopy(props)
    setIsCopying(true)
    setTimeout(() => setIsCopying(false), FEEDBACK_TIMEOUT)
  }

  return {copy, isCopying}
}

type CopyProps = {
  text: string
  feedback?: string
  event?: GestureResponderEvent
}
type ClipboardContext = {
  copy: (a: CopyProps) => void
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    isCopying: {
      position: 'absolute',
      backgroundColor: color.gray_max,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 4,
      zIndex: 10,
    },
    textCopy: {
      textAlign: 'center',
      ...atoms.p_sm,
      ...atoms.body_2_md_medium,
      color: color.gray_min,
    },
  })
  return styles
}

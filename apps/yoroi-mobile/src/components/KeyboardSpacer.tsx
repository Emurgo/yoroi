import * as React from 'react'
import {Animated, Keyboard, Platform} from 'react-native'

const keyboardShowEvent = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow'
const keyboardHideEvent = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide'

type KeyboardSpacerProps = {
  padding?: number
  duration?: number
  debug?: boolean
}

export const KeyboardSpacer = ({padding = 0, duration = 500, debug}: KeyboardSpacerProps) => {
  const paddingRef = React.useRef(new Animated.Value(0))

  React.useEffect(() => {
    const listeners = [
      Keyboard.addListener(keyboardShowEvent, (event) =>
        Animated.timing(paddingRef.current, {
          toValue: event.endCoordinates.height + padding,
          duration,
          useNativeDriver: false,
        }).start(),
      ),

      Keyboard.addListener(keyboardHideEvent, () =>
        Animated.timing(paddingRef.current, {
          toValue: 0,
          duration,
          useNativeDriver: false,
        }).start(),
      ),
    ]

    return () => listeners.forEach((listener) => listener.remove())
  }, [duration, padding])

  return <Animated.View style={[{height: paddingRef.current}, debug && {backgroundColor: 'red', opacity: 0.2}]} />
}

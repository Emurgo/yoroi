import * as React from 'react'
import {Animated, Keyboard} from 'react-native'

type KeyboardSpacerProps = {
  padding?: number
  duration?: number
  debug?: boolean
}
export const KeyboardSpacer = ({padding = 0, duration = 500, debug}: KeyboardSpacerProps) => {
  const paddingRef = React.useRef(new Animated.Value(0))

  React.useEffect(() => {
    const listeners = [
      Keyboard.addListener('keyboardDidShow', (event) =>
        Animated.timing(paddingRef.current, {
          toValue: event.endCoordinates.height + padding,
          duration,
          useNativeDriver: false,
        }).start(),
      ),

      Keyboard.addListener('keyboardDidHide', () =>
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

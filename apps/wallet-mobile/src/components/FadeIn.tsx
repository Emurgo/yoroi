import React from 'react'
import {Animated, ViewStyle} from 'react-native'

export const FadeIn = ({
  delay = 0,
  fadeDuration = 200,
  onStart,
  onEnd,
  style,
  children,
}: {
  delay?: number
  fadeDuration?: number
  onStart?: () => void
  onEnd?: () => void
  style?: ViewStyle
  children: React.ReactNode
}) => {
  const opacity = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    const timeout = setTimeout(() => onStart?.(), delay)
    Animated.timing(opacity, {
      toValue: 1,
      delay,
      duration: fadeDuration,
      useNativeDriver: true,
    }).start(() => onEnd?.())

    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timeout)
  }, [opacity, onStart, onEnd, delay, fadeDuration])

  // eslint-disable-next-line react-native/no-inline-styles
  return <Animated.View style={[{opacity}, style]}>{children}</Animated.View>
}

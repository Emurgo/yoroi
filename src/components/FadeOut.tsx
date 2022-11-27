import React from 'react'
import {Animated, ViewStyle} from 'react-native'

export const FadeOut = ({
  delay = 3000,
  fadeDuration = 2000,
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
  const opacity = React.useRef(new Animated.Value(1)).current

  React.useEffect(() => {
    const timeout = setTimeout(() => onStart?.(), delay)
    Animated.timing(opacity, {
      toValue: 0,
      delay,
      duration: fadeDuration,
      useNativeDriver: true,
    }).start(() => onEnd?.())

    return () => clearTimeout(timeout)
  }, [opacity, onStart, onEnd, delay, fadeDuration])

  return <Animated.View style={[{opacity}, style]}>{children}</Animated.View>
}

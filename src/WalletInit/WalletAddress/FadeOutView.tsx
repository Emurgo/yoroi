import React from 'react'
import {Animated, ViewStyle} from 'react-native'

export const FadeOutView: React.FC<{
  displayDuration?: number
  fadeDuration?: number
  onStart?: () => void
  onEnd?: () => void
  visible: boolean
  style?: ViewStyle
}> = ({displayDuration = 3000, fadeDuration = 2000, onStart, onEnd, visible, style, children}) => {
  const opacity = React.useRef(new Animated.Value(1)).current

  React.useEffect(() => {
    if (!visible) return

    const timeout = setTimeout(() => onStart?.(), displayDuration)
    Animated.timing(opacity, {
      toValue: 0,
      delay: displayDuration,
      duration: fadeDuration,
      useNativeDriver: true,
    }).start(() => onEnd?.())

    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timeout)
  }, [opacity, onStart, onEnd, displayDuration, visible, fadeDuration])

  // eslint-disable-next-line react-native/no-inline-styles
  return <Animated.View style={[{opacity: visible ? opacity : 0}, style]}>{children}</Animated.View>
}

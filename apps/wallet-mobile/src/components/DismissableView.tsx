import * as React from 'react'
import {Animated, ViewStyle} from 'react-native'

type Props = {
  isVisible: boolean
  children: React.ReactNode
  duration?: number
  style?: Exclude<ViewStyle, 'opacity'>
}

export const DismissibleView = ({isVisible, children, style, duration = 300}: Props) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const [shouldRender, setShouldRender] = React.useState(isVisible)

  React.useEffect(() => {
    if (isVisible) {
      fadeAnim.setValue(0)
      setShouldRender(true)
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start()
    } else {
      fadeAnim.setValue(1)
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start(() => setShouldRender(false))
    }
  }, [isVisible, fadeAnim, duration])

  if (!shouldRender) return null

  return <Animated.View style={{...style, opacity: fadeAnim}}>{children}</Animated.View>
}

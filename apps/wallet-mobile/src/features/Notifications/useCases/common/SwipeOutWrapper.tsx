import * as React from 'react'
import {Animated, Dimensions, Easing, PanResponder} from 'react-native'

type Props = {
  children: React.ReactNode
  onSwipeOut: () => void
  onExpired: () => void
}

const notificationDisplayTime = 20 * 1000 // 20 seconds
const fadeInTime = 200
const fadeOutPaddingTime = 100

export const SwipeOutWrapper = ({children, onSwipeOut, onExpired}: Props) => {
  const {pan, panResponder, fadeIn, opacity, fadeOut, translateY} = usePanAnimation({onRelease: onSwipeOut})
  const onExpiredRef = React.useRef(onExpired)
  onExpiredRef.current = onExpired

  React.useEffect(() => {
    const expiredTimeout = setTimeout(() => onExpiredRef.current(), notificationDisplayTime)
    const fadeOutTimeout = setTimeout(() => fadeOut(), notificationDisplayTime - fadeInTime - fadeOutPaddingTime)

    return () => {
      clearTimeout(expiredTimeout)
      clearTimeout(fadeOutTimeout)
    }
  }, [fadeIn, fadeOut])

  React.useLayoutEffect(() => {
    requestAnimationFrame(() => fadeIn())
  }, [fadeIn])

  return (
    <Animated.View
      style={{
        transform: [{translateX: pan.x}, {translateY}],
        opacity,
      }}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  )
}

const usePanAnimation = ({onRelease}: {onRelease: () => void}) => {
  const pan = React.useRef(new Animated.ValueXY()).current
  const opacity = React.useRef(new Animated.Value(0)).current
  const translateY = React.useRef(new Animated.Value(-50)).current
  const screenWidth = Dimensions.get('window').width
  const screenLimitInPercentAfterWhichShouldRelease = 0.3

  const fadeIn = React.useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: fadeInTime,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: fadeInTime,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
    ]).start()
  }, [opacity, translateY])

  const fadeOut = React.useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: fadeInTime,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(translateY, {
        toValue: -50,
        duration: fadeInTime,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
    ]).start()
  }, [opacity, translateY])

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dx > 0) {
          Animated.event([null, {dx: pan.x, dy: pan.y}], {useNativeDriver: false})(e, gestureState)
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dx > screenWidth * screenLimitInPercentAfterWhichShouldRelease) {
          Animated.spring(pan, {
            toValue: {x: screenWidth, y: 0},
            useNativeDriver: false,
          }).start(() => onRelease())
        } else {
          Animated.spring(pan, {
            toValue: {x: 0, y: 0},
            useNativeDriver: false,
          }).start()
        }
      },
    }),
  ).current

  return {pan, panResponder, fadeIn, fadeOut, opacity, translateY}
}

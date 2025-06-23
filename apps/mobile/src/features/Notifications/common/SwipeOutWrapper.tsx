import {useNotificationsConfig} from '@yoroi/notifications'
import * as React from 'react'
import {Animated, Dimensions, Easing, PanResponder} from 'react-native'

type Props = {
  children: React.ReactNode
  onSwipeOut: () => void
  onExpired: () => void
  onPress: () => void
}

const defaultNotificationDisplayDurationInSeconds = 4 // 4 seconds
const fadeInTime = 200
const fadeOutPaddingTime = 100

export const SwipeOutWrapper = ({children, onSwipeOut, onExpired, onPress}: Props) => {
  const {pan, panResponder, fadeIn, opacity, fadeOut, translateY} = usePanAnimation({onRelease: onSwipeOut, onPress})
  const onExpiredRef = React.useRef(onExpired)
  onExpiredRef.current = onExpired

  const fadeOutRef = React.useRef(fadeOut)
  fadeOutRef.current = fadeOut

  const {data: notificationConfig} = useNotificationsConfig()
  const displayDuration = (notificationConfig?.displayDuration ?? defaultNotificationDisplayDurationInSeconds) * 1000

  React.useLayoutEffect(() => {
    requestAnimationFrame(() => {
      fadeIn()

      const expiredTimeout = setTimeout(() => onExpiredRef.current(), displayDuration)
      const fadeOutTimeout = setTimeout(() => fadeOutRef.current(), displayDuration - fadeInTime - fadeOutPaddingTime)

      return () => {
        clearTimeout(expiredTimeout)
        clearTimeout(fadeOutTimeout)
      }
    })
  }, [fadeIn, displayDuration])

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

const usePanAnimation = ({onRelease, onPress}: {onRelease: () => void; onPress: () => void}) => {
  const pan = React.useRef(new Animated.ValueXY()).current
  const opacity = React.useRef(new Animated.Value(0)).current
  const translateY = React.useRef(new Animated.Value(-50)).current
  const screenWidth = Dimensions.get('window').width
  const screenLimitInPercentAfterWhichShouldRelease = 0.3
  const slightMovementThreshold = 10

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
        const shouldFinishSwipe = gestureState.dx > screenWidth * screenLimitInPercentAfterWhichShouldRelease

        if (shouldFinishSwipe) {
          Animated.spring(pan, {toValue: {x: screenWidth, y: 0}, useNativeDriver: false}).start(() => onRelease())
          return
        }

        const isSlightMovement =
          Math.abs(gestureState.dx) < slightMovementThreshold && Math.abs(gestureState.dy) < slightMovementThreshold

        if (isSlightMovement) {
          onPress()
          return
        }

        Animated.spring(pan, {toValue: {x: 0, y: 0}, useNativeDriver: false}).start()
      },
    }),
  ).current

  return {pan, panResponder, fadeIn, fadeOut, opacity, translateY}
}

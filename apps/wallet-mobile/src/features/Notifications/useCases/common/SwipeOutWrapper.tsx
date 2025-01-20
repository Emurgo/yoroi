import * as React from 'react'
import {Animated, Dimensions, Easing, PanResponder} from 'react-native'
import {useEffect} from 'react'

type Props = {
  children: React.ReactNode
  onSwipeOut: () => void
  onExpired: () => void
}

const notificationDisplayTime = 20 * 1000 // 20 seconds
const fadeInTime = 200
const fadeOutPaddingTime = 100

export const SwipeOutWrapper = ({children, onSwipeOut, onExpired}: Props) => {
  const {pan, panResponder, fadeIn, opacity, fadeOut} = usePanAnimation({onRelease: onSwipeOut})

  useEffect(() => {
    setTimeout(() => onExpired(), notificationDisplayTime)
    setTimeout(() => fadeOut(), notificationDisplayTime - fadeInTime - fadeOutPaddingTime)
  }, [])

  React.useEffect(() => {
    setTimeout(() => fadeIn(), 1)
  }, [fadeIn])

  return (
    <Animated.View
      style={{
        transform: [{translateX: pan.x}],
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
  const screenWidth = Dimensions.get('window').width
  const screenLimitInPercentAfterWhichShouldRelease = 0.3

  const fadeIn = React.useCallback(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: fadeInTime,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.ease),
    }).start()
  }, [opacity])

  const fadeOut = React.useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: fadeInTime,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.ease),
    }).start()
  }, [opacity])

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

  return {pan, panResponder, fadeIn, fadeOut, opacity}
}

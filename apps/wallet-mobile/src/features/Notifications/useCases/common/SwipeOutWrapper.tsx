import * as React from 'react'
import {Animated, Dimensions, PanResponder} from 'react-native'

type Props = {
  children: React.ReactNode
  onSwipeOut: () => void
}

export const SwipeOutWrapper = ({children, onSwipeOut}: Props) => {
  const {pan, panResponder} = usePanAnimation({onRelease: onSwipeOut})

  return (
    <Animated.View
      style={{
        transform: [{translateX: pan.x}],
      }}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  )
}

const usePanAnimation = ({onRelease}: {onRelease: () => void}) => {
  const pan = React.useRef(new Animated.ValueXY()).current
  const screenWidth = Dimensions.get('window').width
  const screenLimitInPercentAfterWhichShouldRelease = 0.3

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

  return {pan, panResponder}
}

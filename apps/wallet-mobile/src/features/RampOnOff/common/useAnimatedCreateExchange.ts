import React from 'react';
import { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

const initialTranslateYOffset = 200
const animatedConfig = {
  duration: 1500,
  dampingRatio: 0.5,
  stiffness: 300,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 2,
}

const useAnimatedCreateExchange = () => {
  const translateYOffset = useSharedValue(initialTranslateYOffset)
  const translateStyles = useAnimatedStyle(() => ({
    transform: [{translateY: translateYOffset.value}],
  }))

  React.useLayoutEffect(() => {
    translateYOffset.value = withDelay(150, withSpring(0, animatedConfig))
  }, [translateYOffset])

  return {translateStyles}
};

export { useAnimatedCreateExchange };

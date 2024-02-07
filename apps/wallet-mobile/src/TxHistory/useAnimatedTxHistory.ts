import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated'

const initialTranslateYOffset = -2000
const animatedConfig = {
  mass: 1,
  damping: 30,
  stiffness: 250,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 2,
}

const useAnimatedTxHistory = () => {
  const navigation = useNavigation()

  const translateYOffset = useSharedValue(initialTranslateYOffset)
  const translateStyles = useAnimatedStyle(() => ({
    transform: [{translateY: translateYOffset.value}],
  }))

  React.useLayoutEffect(() => {
    translateYOffset.value = withSpring(0, animatedConfig)

    const cleanUpFocus = navigation.addListener('focus', () => {
      translateYOffset.value = withSpring(0, animatedConfig)
    })

    const cleanUpBlur = navigation.addListener('blur', () => {
      translateYOffset.value = withSpring(initialTranslateYOffset, animatedConfig)
    })

    return () => {
      cleanUpFocus()
      cleanUpBlur()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {translateStyles}
}

export {useAnimatedTxHistory}

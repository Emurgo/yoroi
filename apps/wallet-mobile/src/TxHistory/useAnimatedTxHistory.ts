import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated'

const initialTranslateYOffset = 2000
const animatedConfig = {
  duration: 1000,
  dampingRatio: 1.5,
  stiffness: 100,
}

const useAnimatedTxHistory = () => {
  const navigation = useNavigation()

  const translateYOffset = useSharedValue(initialTranslateYOffset)
  const translateStyles = useAnimatedStyle(() => ({
    transform: [{translateY: translateYOffset.value}],
  }))

  React.useLayoutEffect(() => {
    if (translateYOffset.value !== 0) {
      translateYOffset.value = withSpring(0, animatedConfig)
    }

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

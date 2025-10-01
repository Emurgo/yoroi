import {time} from '@yoroi/common'
import {atoms as a, space as s, useTheme} from '@yoroi/theme'

import * as Haptics from 'expo-haptics'
import * as React from 'react'
import {Pressable, View} from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import {useIsKeyboardOpen} from '~/hooks/useIsKeyboardOpen'

import {useModal} from '../../context/ModalContext'

const DiscardIndicator = ({onDragYChange, children}: Props) => {
  const {atoms: ta} = useTheme()
  const {
    canExpand,
    hasExpanded,
    setHasExpanded,
    closeModal,
    withFeedback,
    height,
    canDiscard,
    full,
  } = useModal()
  const isKeyboardOpen = useIsKeyboardOpen()
  const animatedWidth = useSharedValue(width)
  const dragY = useSharedValue(0)

  const createDragGesture = () => {
    return Gesture.Pan()
      .onUpdate((event) => {
        'worklet'
        if (event.translationY < 0 && !canExpand) {
          dragY.value = Math.max(0, event.translationY)
        } else {
          dragY.value = event.translationY
        }
        runOnJS(onDragYChange)(dragY.value)
      })
      .onEnd((event) => {
        'worklet'
        if (event.translationY < 0 && !hasExpanded && canExpand) {
          const threshold = -(height * 0.2)
          if (event.translationY <= threshold) {
            runOnJS(setHasExpanded)(true)
          }
        }
        if (
          event.translationY > 100 &&
          event.velocityY > 0 &&
          !isKeyboardOpen
        ) {
          runOnJS(closeModal)()
        } else {
          dragY.value = withSpring(0)
          runOnJS(onDragYChange)(0)
        }
      })
  }

  const widthAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: animatedWidth.value,
    }
  })

  React.useEffect(() => {
    if (withFeedback) {
      animatedWidth.value = s.xs
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      animatedWidth.value = withSpring(width, {
        duration: time.seconds(2.3),
      })
    } else {
      animatedWidth.value = width
    }
  }, [withFeedback, animatedWidth])

  if (!canDiscard || hasExpanded || full) return children

  return (
    <GestureHandlerRootView style={[a.flex]}>
      <GestureDetector gesture={createDragGesture()}>
        <View style={[a.align_center, a.pt_sm, a.pb_xs]}>
          <View style={[{height: s.sm, width}]}>
            <Animated.View
              style={[
                {
                  height: s.xs,
                  backgroundColor: ta.el_gray_min.color,
                },
                a.rounded_xs,
                widthAnimatedStyle,
              ]}
            />
          </View>
          {children}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}

export const DiscardBackdrop = () => {
  const {closeModal, canDiscard} = useModal()

  if (!canDiscard) return null

  return <Pressable onPress={closeModal} style={[a.absolute, a.inset_0]} />
}

type Props = React.PropsWithChildren<{
  onDragYChange: (dragY: number) => void
}>

const width = s._2xl * 1.5

export const Discard = {
  Indicator: DiscardIndicator,
  Backdrop: DiscardBackdrop,
}

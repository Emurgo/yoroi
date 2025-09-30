import {time} from '@yoroi/common'
import {atoms as a, space as s, useTheme} from '@yoroi/theme'

import * as Haptics from 'expo-haptics'
import * as React from 'react'
import {
  Easing,
  Pressable,
  Animated as RNAnimated,
  Modal as RNModal,
  View,
} from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import {KeyboardAvoidingView} from 'react-native-keyboard-controller'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {useIsKeyboardOpen} from '~/hooks/useIsKeyboardOpen'

import {useModal} from '../../../context/ModalContext'
import {ModalContentWrapper} from '../../shared/Wrappers/ModalContentWrapper'
import {ModalFooterWrapper} from '../../shared/Wrappers/ModalFooterWrapper'
import {ModalWrapper} from './ModalWrapper'

const Modal = () => {
  const {
    content,
    canDiscard,
    footer,
    title,
    full,
    isOpen,
    closeModal,
    height,
    withFeedback,
    hasExpanded,
    canExpand,
    setHasExpanded,
  } = useModal()
  const {palette: p, isDark} = useTheme()
  const isKeyboardOpen = useIsKeyboardOpen()
  useSafeAreaInsets()
  const backdropOpacity = React.useRef(new RNAnimated.Value(0)).current
  const [isVisible, setIsVisible] = React.useState(isOpen)

  const lastContentRef = React.useRef(content)
  const lastTitleRef = React.useRef(title)
  const lastFooterRef = React.useRef(footer)
  const lastFullRef = React.useRef(full)
  const lastHeightRef = React.useRef(height)
  const lastCanDiscardRef = React.useRef(canDiscard)
  const lastWithFeedbackRef = React.useRef(withFeedback)
  const lastHasExpandedRef = React.useRef(hasExpanded)
  const lastCanExpandRef = React.useRef(canExpand)

  React.useEffect(() => {
    if (isOpen) {
      lastContentRef.current = content
      lastTitleRef.current = title
      lastFooterRef.current = footer
      lastFullRef.current = full
      lastHeightRef.current = height
      lastCanDiscardRef.current = canDiscard
      lastWithFeedbackRef.current = withFeedback
      lastHasExpandedRef.current = hasExpanded
      lastCanExpandRef.current = canExpand
    }
  }, [
    isOpen,
    content,
    title,
    footer,
    full,
    height,
    canDiscard,
    withFeedback,
    hasExpanded,
    canExpand,
  ])

  const visibleContent = isOpen ? content : lastContentRef.current
  const visibleTitle = isOpen ? title : lastTitleRef.current
  const visibleHeight = isOpen ? height : lastHeightRef.current
  const visibleFooter = isOpen ? footer : lastFooterRef.current

  const isFull = isOpen ? full : lastFullRef.current
  const canDiscardEnabled = isOpen ? canDiscard : lastCanDiscardRef.current
  const withFeedbackEnabled = isOpen
    ? withFeedback
    : lastWithFeedbackRef.current
  const hasExpandedEnabled = isOpen ? hasExpanded : lastHasExpandedRef.current
  const canExpandEnabled = isOpen ? canExpand : lastCanExpandRef.current

  const dragY = useSharedValue(0)
  const modalTranslateY = useSharedValue(48)
  const modalHeight = useSharedValue(visibleHeight)
  const isExpanded = useSharedValue(hasExpandedEnabled)

  const createDragGesture = () => {
    return Gesture.Pan()
      .onUpdate((event) => {
        'worklet'
        if (event.translationY < 0 && !canExpandEnabled) {
          dragY.value = Math.max(0, event.translationY)
        } else {
          dragY.value = event.translationY
        }
      })
      .onEnd((event) => {
        'worklet'
        if (event.translationY < 0 && !hasExpandedEnabled && canExpandEnabled) {
          const threshold = -(visibleHeight * 0.2)
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
        }
      })
  }

  // Combined animated style for both entrance and drag animations
  const combinedModalStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: modalTranslateY.value + dragY.value}],
    }
  })

  const heightAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: isExpanded.value ? '100%' : modalHeight.value,
    }
  })

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      backdropOpacity.setValue(0)
      modalTranslateY.value = 48
      dragY.value = 0
      modalHeight.value = visibleHeight
      isExpanded.value = hasExpandedEnabled
      RNAnimated.parallel([
        RNAnimated.timing(backdropOpacity, {
          toValue: 1,
          duration: time.seconds(0.3),
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start()
      modalTranslateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      })
    } else {
      RNAnimated.parallel([
        RNAnimated.timing(backdropOpacity, {
          toValue: 0,
          duration: time.seconds(0.3),
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false)
      })
      modalTranslateY.value = withSpring(24, {
        damping: 15,
        stiffness: 150,
      })
    }
  }, [
    isOpen,
    backdropOpacity,
    modalTranslateY,
    dragY,
    modalHeight,
    visibleHeight,
    hasExpandedEnabled,
    isExpanded,
  ])

  React.useEffect(() => {
    isExpanded.value = hasExpandedEnabled
  }, [hasExpandedEnabled, isExpanded])

  const handleOnRequestClose = React.useCallback(() => {
    if (canDiscardEnabled) closeModal()
  }, [canDiscardEnabled, closeModal])

  return (
    <RNModal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      hardwareAccelerated
      focusable
      navigationBarTranslucent
      onRequestClose={handleOnRequestClose}
    >
      <View style={[a.flex_1]}>
        <RNAnimated.View
          style={[
            a.absolute,
            a.inset_0,
            {zIndex: 0},
            {
              backgroundColor: 'rgba(0,0,0,0.4)',
              opacity: backdropOpacity,
            },
          ]}
        />
        {canDiscardEnabled && (
          <Pressable onPress={closeModal} style={[a.absolute, a.inset_0]} />
        )}
        <View style={[a.flex_1, a.justify_end]}>
          <KeyboardAvoidingView behavior="padding">
            <Animated.View
              style={[
                a.self_stretch,
                a.overflow_hidden,
                {zIndex: 1},
                {backgroundColor: isDark ? p.gray_50 : p.white_static},
                {
                  borderTopLeftRadius: s.xl,
                  borderTopRightRadius: s.xl,
                },
                combinedModalStyle,
                heightAnimatedStyle,
              ]}
            >
              {canDiscardEnabled && !hasExpandedEnabled && !isFull && (
                <GestureHandlerRootView style={[a.flex]}>
                  <GestureDetector gesture={createDragGesture()}>
                    <View style={[a.align_center, a.pt_sm, a.pb_xs]}>
                      <DiscardIndicator withFeedback={withFeedbackEnabled} />
                    </View>
                  </GestureDetector>
                </GestureHandlerRootView>
              )}

              <ModalWrapper
                title={visibleTitle}
                footer={visibleFooter}
                edges={
                  isFull
                    ? []
                    : hasExpandedEnabled
                      ? ['top', 'right', 'left']
                      : ['right', 'left']
                }
              >
                {visibleContent}
              </ModalWrapper>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </RNModal>
  )
}

const width = s._2xl * 1.5

type DiscardIndicatorProps = {
  withFeedback?: boolean
}

const DiscardIndicator = ({withFeedback = false}: DiscardIndicatorProps) => {
  const {atoms: ta} = useTheme()
  const animatedWidth = useSharedValue(width)

  const widthAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: animatedWidth.value,
    }
  })

  React.useEffect(() => {
    if (withFeedback) {
      animatedWidth.value = s.xs
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      animatedWidth.value = withSpring(width, {
        duration: time.oneSecond,
      })
    } else {
      animatedWidth.value = width
    }
  }, [withFeedback, animatedWidth])

  return (
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
  )
}

Modal.Content = ModalContentWrapper
Modal.Footer = ModalFooterWrapper

export {Modal}

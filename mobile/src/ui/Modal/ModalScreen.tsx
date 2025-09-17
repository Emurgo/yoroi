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

import {useModal} from './ModalContext'
import {SafeAreaModalWrapper} from './SafeAreaModalWrapper'
import {useDismissOrClose} from './hooks'

export const DISMISS_THRESHOLD = 15

export const Modal = () => {
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
  } = useModal()
  const {palette: p, isDark} = useTheme()
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

  React.useEffect(() => {
    if (isOpen) {
      lastContentRef.current = content
      lastTitleRef.current = title
      lastFooterRef.current = footer
      lastFullRef.current = full
      lastHeightRef.current = height
      lastCanDiscardRef.current = canDiscard
      lastWithFeedbackRef.current = withFeedback
    }
  }, [isOpen, content, title, footer, full, height, canDiscard, withFeedback])

  const visibleContent = isOpen ? content : lastContentRef.current
  const visibleTitle = isOpen ? title : lastTitleRef.current
  const visibleHeight = isOpen ? height : lastHeightRef.current
  const visibleFooter = isOpen ? footer : lastFooterRef.current

  const isFull = isOpen ? full : lastFullRef.current
  const canDiscardEnabled = isOpen ? canDiscard : lastCanDiscardRef.current
  const withFeedbackEnabled = isOpen
    ? withFeedback
    : lastWithFeedbackRef.current

  const handleClose = React.useCallback(() => {
    closeModal()
  }, [closeModal])

  const handleDismissOrClose = useDismissOrClose()

  // Shared values for both entrance and drag animations
  const dragY = useSharedValue(0)
  const modalTranslateY = useSharedValue(48) // Start off-screen

  // Create drag gesture for the top area of the modal
  const createDragGesture = () => {
    return Gesture.Pan()
      .onUpdate((event) => {
        'worklet'
        dragY.value = event.translationY
      })
      .onEnd((event) => {
        'worklet'
        if (event.translationY > 100 && event.velocityY > 0) {
          runOnJS(handleDismissOrClose)()
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

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      backdropOpacity.setValue(0)
      modalTranslateY.value = 48
      dragY.value = 0
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
          duration: time.seconds(0.2),
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
  }, [isOpen, backdropOpacity, modalTranslateY, dragY])

  const handleOnRequestClose = React.useCallback(() => {
    if (canDiscardEnabled) handleClose()
  }, [canDiscardEnabled, handleClose])

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
          <Pressable
            onPress={handleDismissOrClose}
            style={[a.absolute, a.inset_0]}
          />
        )}
        <View style={[a.flex_1, a.justify_end]}>
          <KeyboardAvoidingView behavior="padding">
            <Animated.View
              style={[
                isFull ? a.flex_1 : {height: visibleHeight},
                a.self_stretch,
                a.overflow_hidden,
                {zIndex: 1},
                {backgroundColor: isDark ? p.gray_50 : p.white_static},
                {
                  borderTopLeftRadius: s.xl,
                  borderTopRightRadius: s.xl,
                },
                combinedModalStyle,
              ]}
            >
              {canDiscardEnabled && !isFull && (
                <GestureHandlerRootView style={[a.flex]}>
                  <GestureDetector gesture={createDragGesture()}>
                    <View style={[a.align_center, a.pt_sm, a.pb_xs]}>
                      <DiscardIndicator withFeedback={withFeedbackEnabled} />
                    </View>
                  </GestureDetector>
                </GestureHandlerRootView>
              )}

              <SafeAreaModalWrapper
                title={visibleTitle}
                footer={visibleFooter}
                edges={isFull ? [] : undefined}
              >
                {visibleContent}
              </SafeAreaModalWrapper>
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

  // Animated style for the width
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
        duration: 1000,
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

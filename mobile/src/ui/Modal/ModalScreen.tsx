import {time} from '@yoroi/common'
import {atoms as a, space as s, useTheme} from '@yoroi/theme'

import * as Haptics from 'expo-haptics'
import * as React from 'react'
import {
  Animated,
  Easing,
  Pressable,
  Modal as RNModal,
  Text,
  View,
} from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import {KeyboardAvoidingView} from 'react-native-keyboard-controller'
import {runOnJS} from 'react-native-reanimated'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {ModalContentWrapper} from './ModalContentWrapper'
import {useModal} from './ModalContext'
import {useDismissOrClose} from './hooks'

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
  const backdropOpacity = React.useRef(new Animated.Value(0)).current
  const sheetTranslateY = React.useRef(new Animated.Value(24)).current
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

  const panGesture = Gesture.Pan()
    .enabled(Boolean(canDiscardEnabled) && !isFull)
    .onEnd((event) => {
      'worklet'
      if (event.translationY > 100 && event.velocityY > 0) {
        runOnJS(handleDismissOrClose)()
      }
    })

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      backdropOpacity.setValue(0)
      sheetTranslateY.setValue(48)
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: time.seconds(0.3),
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 9,
          tension: 70,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: time.seconds(0.2),
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 24,
          duration: time.seconds(0.25),
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false)
      })
    }
  }, [isOpen, backdropOpacity, sheetTranslateY])

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
      <GestureHandlerRootView style={[a.flex_1]}>
        <View style={[a.flex_1, a.self_stretch, a.justify_end]}>
          <Animated.View
            style={[
              a.absolute,
              a.inset_0,
              {
                backgroundColor: 'rgba(0,0,0,0.4)',
                opacity: backdropOpacity,
              },
            ]}
          />
          <Pressable
            onPress={canDiscardEnabled ? handleDismissOrClose : undefined}
            style={[a.absolute, a.inset_0]}
          />
          <KeyboardAvoidingView behavior="padding" style={[a.justify_end]}>
            <Animated.View
              style={[
                isFull ? a.flex_1 : {height: visibleHeight},
                a.self_stretch,
                a.overflow_hidden,
                {backgroundColor: isDark ? p.gray_50 : p.white_static},
                {transform: [{translateY: sheetTranslateY}]},
                {
                  borderTopLeftRadius: s.xl,
                  borderTopRightRadius: s.xl,
                },
              ]}
            >
              {canDiscardEnabled && !isFull && (
                <GestureDetector gesture={panGesture}>
                  <View style={[a.align_center, a.pt_sm, a.pb_xs]}>
                    <DiscardIndicator withFeedback={withFeedbackEnabled} />
                  </View>
                </GestureDetector>
              )}

              {visibleTitle && (
                <View style={[a.py_sm]}>
                  <Title title={visibleTitle} />
                </View>
              )}

              {visibleContent && (
                <ModalContentWrapper
                  content={visibleContent}
                  footer={visibleFooter}
                />
              )}
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </GestureHandlerRootView>
    </RNModal>
  )
}

const width = s._2xl * 1.5
const DiscardIndicator = ({withFeedback = false}: {withFeedback?: boolean}) => {
  const {atoms: ta} = useTheme()
  const animatedWidth = React.useRef(new Animated.Value(width)).current

  React.useEffect(() => {
    if (withFeedback) {
      animatedWidth.setValue(s.xs)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      Animated.timing(animatedWidth, {
        toValue: width,
        duration: time.seconds(1),
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start()
    } else {
      animatedWidth.setValue(width)
    }
  }, [withFeedback, animatedWidth])

  return (
    <View style={[{height: s.sm, width}]}>
      <Animated.View
        style={[
          {
            width: animatedWidth,
            height: s.xs,
            backgroundColor: ta.el_gray_min.color,
          },
          a.rounded_xs,
        ]}
      />
    </View>
  )
}

const Title = ({title}: {title: string}) => {
  const {atoms: ta} = useTheme()
  return (
    <Text style={[a.heading_3_medium, ta.text_gray_max, a.text_center]}>
      {title}
    </Text>
  )
}

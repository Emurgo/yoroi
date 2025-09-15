import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {
  Animated,
  Easing,
  Keyboard,
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

import {useIsKeyboardOpen} from '~/hooks/useIsKeyboardOpen'
import {Space} from '~/ui/Space/Space'

import {useModal} from './ModalContext'

export const Modal = () => {
  const {content, canDiscard, footer, title, full, isOpen, closeModal, height} =
    useModal()
  const {atoms: ta, palette: p, isDark} = useTheme()
  useSafeAreaInsets()
  const backdropOpacity = React.useRef(new Animated.Value(0)).current
  const sheetTranslateY = React.useRef(new Animated.Value(24)).current
  const [isVisible, setIsVisible] = React.useState(isOpen)
  const isKeyboardOpen = useIsKeyboardOpen()

  const lastContentRef = React.useRef(content)
  const lastTitleRef = React.useRef(title)
  const lastFooterRef = React.useRef(footer)
  const lastFullRef = React.useRef(full)
  const lastHeightRef = React.useRef(height)
  const lastCanDiscardRef = React.useRef(canDiscard)

  React.useEffect(() => {
    if (isOpen) {
      lastContentRef.current = content
      lastTitleRef.current = title
      lastFooterRef.current = footer
      lastFullRef.current = full
      lastHeightRef.current = height
      lastCanDiscardRef.current = canDiscard
    }
  }, [isOpen, content, title, footer, full, height, canDiscard])

  const rContent = isOpen ? content : lastContentRef.current
  const rTitle = isOpen ? title : lastTitleRef.current
  const rFooter = isOpen ? footer : lastFooterRef.current
  const rFull = isOpen ? full : lastFullRef.current
  const rHeight = isOpen ? height : lastHeightRef.current
  const rCanDiscard = isOpen ? canDiscard : lastCanDiscardRef.current
  const handleClose = React.useCallback(() => {
    closeModal()
  }, [closeModal])

  const handleDismissOrClose = React.useCallback(() => {
    if (isKeyboardOpen) {
      Keyboard.dismiss()
      return
    }
    closeModal()
  }, [closeModal, isKeyboardOpen])

  const panGesture = Gesture.Pan()
    .enabled(Boolean(rCanDiscard) && !rFull)
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
          duration: 300,
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
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 24,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false)
      })
    }
  }, [isOpen, backdropOpacity, sheetTranslateY])

  return (
    <RNModal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={() => {
        if (canDiscard) handleClose()
      }}
    >
      <GestureHandlerRootView style={[a.flex_1]}>
        <View style={[a.flex_1, a.self_stretch, a.justify_end]}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
                opacity: backdropOpacity,
              },
            ]}
          />
          <Pressable
            onPress={rCanDiscard ? handleDismissOrClose : undefined}
            style={[a.flex_1, a.justify_end]}
          >
            <KeyboardAvoidingView behavior="padding" style={[a.justify_end]}>
              <GestureDetector gesture={panGesture}>
                <Pressable onPress={(e) => e.stopPropagation()}>
                  <Animated.View
                    style={[
                      rFull ? a.flex_1 : null,
                      a.self_stretch,
                      {backgroundColor: isDark ? p.gray_50 : p.white_static},
                      !rFull && {height: rHeight},
                      {transform: [{translateY: sheetTranslateY}]},
                      {
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        overflow: 'hidden',
                      },
                    ]}
                  >
                    {rCanDiscard && !rFull && (
                      <View style={[a.align_center, a.pt_sm, a.pb_xs]}>
                        <View
                          style={[
                            {
                              width: 36,
                              height: 4,
                              backgroundColor: isDark ? p.gray_400 : p.gray_300,
                              borderRadius: 2,
                            },
                          ]}
                        />
                      </View>
                    )}
                    {rTitle ? (
                      <View style={[a.px_lg, a.pt_lg, a.pb_lg]}>
                        <Text
                          style={[
                            a.heading_3_medium,
                            ta.text_gray_max,
                            a.text_center,
                          ]}
                        >
                          {rTitle}
                        </Text>
                      </View>
                    ) : null}

                    {rFull ? (
                      <View style={[a.flex_1]}>{rContent}</View>
                    ) : (
                      rContent
                    )}

                    {rFooter ? (
                      <View style={[a.px_lg, a.pb_lg, a.pt_md]}>
                        {rFooter}
                        <Space.Height.xl />
                      </View>
                    ) : (
                      !rFull && <Space.Height.xl />
                    )}
                  </Animated.View>
                </Pressable>
              </GestureDetector>
            </KeyboardAvoidingView>
          </Pressable>
        </View>
      </GestureHandlerRootView>
    </RNModal>
  )
}

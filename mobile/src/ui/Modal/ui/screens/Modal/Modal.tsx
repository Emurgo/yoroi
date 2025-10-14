import {time} from '@yoroi/common'
import {atoms as a, space as s, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {DimensionValue, Modal as RNModal, View} from 'react-native'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {KeyboardAvoidingView} from '~/ui/KeyboardAvoidingView/KeyboardAvoidingView'

import {useModal} from '../../../context/ModalContext'
import {Discard} from '../../shared/Discard'
import {ModalContentWrapper} from '../../shared/ModalContentWrapper'
import {ModalFooterWrapper} from '../../shared/ModalFooterWrapper'
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
    hasExpanded,
  } = useModal()
  const {palette: p, isDark} = useTheme()
  useSafeAreaInsets()
  const backdropOpacity = useSharedValue(0)
  const [isVisible, setIsVisible] = React.useState(isOpen)

  const lastContentRef = React.useRef(content)
  const lastTitleRef = React.useRef(title)
  const lastFooterRef = React.useRef(footer)
  const lastFullRef = React.useRef(full)
  const lastHeightRef = React.useRef(height)
  const lastCanDiscardRef = React.useRef(canDiscard)
  const lastHasExpandedRef = React.useRef(hasExpanded)

  React.useEffect(() => {
    if (isOpen) {
      lastContentRef.current = content
      lastTitleRef.current = title
      lastFooterRef.current = footer
      lastFullRef.current = full
      lastHeightRef.current = height
      lastCanDiscardRef.current = canDiscard
      lastHasExpandedRef.current = hasExpanded
    }
  }, [isOpen, content, title, footer, full, height, canDiscard, hasExpanded])

  const visibleContent = isOpen ? content : lastContentRef.current
  const visibleTitle = isOpen ? title : lastTitleRef.current
  const visibleFooter = isOpen ? footer : lastFooterRef.current

  const isFull = isOpen ? full : lastFullRef.current
  const canDiscardEnabled = isOpen ? canDiscard : lastCanDiscardRef.current
  const hasExpandedEnabled = isOpen ? hasExpanded : lastHasExpandedRef.current

  const modalTranslateY = useSharedValue(48)
  const modalHeight = useSharedValue<DimensionValue>(full ? '100%' : height)
  const isExpanded = useSharedValue(hasExpandedEnabled)
  const dragY = useSharedValue(0)

  const modalStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: modalTranslateY.value + dragY.value}],
    }
  })

  const heightAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: isExpanded.value || full ? '100%' : modalHeight.value,
    }
  })

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    }
  })

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      backdropOpacity.value = 0
      modalTranslateY.value = isFull ? 0 : 48
      dragY.value = 0
      modalHeight.value = isFull ? '100%' : height
      isExpanded.value = hasExpandedEnabled

      backdropOpacity.value = withTiming(1, {
        duration: time.seconds(0.3),
      })
      if (!isFull) {
        modalTranslateY.value = withSpring(0, {
          damping: 20,
          stiffness: 100,
        })
      }
    } else {
      backdropOpacity.value = withTiming(
        0,
        {
          duration: time.seconds(0.3),
        },
        () => {
          runOnJS(setIsVisible)(false)
        },
      )
      if (!isFull) {
        modalTranslateY.value = withSpring(24, {
          damping: 20,
          stiffness: 100,
        })
      }
    }
  }, [
    isOpen,
    backdropOpacity,
    modalTranslateY,
    dragY,
    modalHeight,
    height,
    hasExpandedEnabled,
    isExpanded,
    isFull,
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
        <Animated.View
          style={[
            a.absolute,
            a.inset_0,
            {zIndex: 0},
            {
              backgroundColor: 'rgba(0,0,0,0.4)',
            },
            backdropStyle,
          ]}
        />
        <Discard.Backdrop />

        <View style={[a.flex_1, a.justify_end]}>
          <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={0}>
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
                modalStyle,
                heightAnimatedStyle,
              ]}
            >
              <ModalWrapper
                title={visibleTitle}
                footer={visibleFooter}
                edges={
                  isFull
                    ? []
                    : hasExpandedEnabled
                      ? ['top', 'right', 'left', 'bottom']
                      : ['right', 'left', 'bottom']
                }
                dragY={dragY}
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

Modal.Content = ModalContentWrapper
Modal.Footer = ModalFooterWrapper

export {Modal}

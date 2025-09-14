import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  Platform,
  Pressable,
  Modal as RNModal,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {Space} from '~/ui/Space/Space'

import {useModal} from './ModalContext'

export const Modal = () => {
  const {content, canDiscard, footer, title, full, isOpen, closeModal, height} =
    useModal()
  const {atoms: ta, palette: p, isDark} = useTheme()
  const {height: windowHeight} = useWindowDimensions()
  const {bottom: safeBottom} = useSafeAreaInsets()
  const backdropOpacity = React.useRef(new Animated.Value(0)).current
  const keyboardOffset = React.useRef(new Animated.Value(0)).current
  const sheetOpacity = React.useRef(new Animated.Value(0)).current
  const [, setKeyboardVisible] = React.useState(false)
  const handleClose = React.useCallback(() => {
    Keyboard.dismiss()
    closeModal()
  }, [closeModal])

  React.useEffect(() => {
    if (isOpen) {
      sheetOpacity.setValue(0)
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      backdropOpacity.setValue(0)
      keyboardOffset.setValue(0)
      sheetOpacity.setValue(0)
      setKeyboardVisible(false)
    }
  }, [isOpen, backdropOpacity, keyboardOffset, sheetOpacity])

  React.useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const onShow = (e: any) => {
      setKeyboardVisible(true)
      const winH = Dimensions.get('window').height
      const endY = e?.endCoordinates?.screenY ?? winH
      const androidHeight = Math.max(0, winH - endY)
      const kHeight =
        Platform.OS === 'android'
          ? typeof e?.endCoordinates?.height === 'number'
            ? e.endCoordinates.height
            : androidHeight
          : (e?.endCoordinates?.height ?? 0)
      const duration = Platform.OS === 'ios' ? (e?.duration ?? 250) : 150
      Animated.timing(keyboardOffset, {
        toValue: kHeight,
        duration,
        useNativeDriver: true,
      }).start()
    }

    const onHide = (e: any) => {
      setKeyboardVisible(false)
      const duration = Platform.OS === 'ios' ? (e?.duration ?? 250) : 150
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start()
    }

    const subShow = Keyboard.addListener(showEvent, onShow)
    const subHide = Keyboard.addListener(hideEvent, onHide)
    const subChangeFrame =
      Platform.OS === 'android'
        ? Keyboard.addListener('keyboardDidChangeFrame', (e: any) => {
            const winH = Dimensions.get('window').height
            const endY = e?.endCoordinates?.screenY ?? winH
            const h = Math.max(0, winH - endY)
            keyboardOffset.setValue(h)
          })
        : undefined

    return () => {
      subShow.remove()
      subHide.remove()
      subChangeFrame?.remove?.()
    }
  }, [keyboardOffset, windowHeight, safeBottom])

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={() => {
        if (canDiscard) handleClose()
      }}
    >
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
        >
          <Pressable
            onPress={canDiscard ? handleClose : undefined}
            style={[{flex: 1}]}
          />
        </Animated.View>
        <View style={[a.self_stretch]}>
          <Animated.View
            style={[
              full ? a.flex_1 : null,
              a.self_stretch,
              {backgroundColor: isDark ? p.gray_50 : p.white_static},
              !full && {height},
              Platform.OS === 'android'
                ? {
                    transform: [
                      {
                        translateY: Animated.multiply(keyboardOffset, -1),
                      },
                    ],
                  }
                : null,
              {
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                overflow: 'hidden',
              },
              {opacity: sheetOpacity},
            ]}
          >
            {title ? (
              <View style={[a.px_lg, a.pt_lg, a.pb_lg]}>
                <Text
                  style={[a.heading_3_medium, ta.text_gray_max, a.text_center]}
                >
                  {title}
                </Text>
              </View>
            ) : null}

            {full ? <View style={[a.flex_1]}>{content}</View> : content}

            {footer ? (
              <View style={[a.px_lg, a.pb_lg, a.pt_md]}>
                {footer}
                <Space.Height.xl />
              </View>
            ) : (
              !full && <Space.Height.xl />
            )}
          </Animated.View>
        </View>
      </View>
    </RNModal>
  )
}

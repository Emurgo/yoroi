import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  Modal as RNModal,
  Text,
  View,
} from 'react-native'
import {KeyboardAvoidingView} from 'react-native-keyboard-controller'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {Space} from '~/ui/Space/Space'

import {useModal} from './ModalContext'

export const Modal = () => {
  const {content, canDiscard, footer, title, full, isOpen, closeModal, height} =
    useModal()
  const {atoms: ta, palette: p, isDark} = useTheme()
  useSafeAreaInsets()
  const backdropOpacity = React.useRef(new Animated.Value(0)).current
  const handleClose = React.useCallback(() => {
    closeModal()
  }, [closeModal])

  React.useEffect(() => {
    if (isOpen) {
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start()
    } else {
      backdropOpacity.setValue(0)
    }
  }, [isOpen, backdropOpacity])

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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
          style={[a.self_stretch, a.justify_end]}
        >
          <View
            style={[
              full ? a.flex_1 : null,
              a.self_stretch,
              {backgroundColor: isDark ? p.gray_50 : p.white_static},
              !full && {height},
              {
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                overflow: 'hidden',
              },
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
          </View>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  )
}

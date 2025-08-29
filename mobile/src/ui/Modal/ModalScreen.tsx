import {atoms as a, useTheme} from '@yoroi/theme'

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import * as React from 'react'
import {Keyboard, Platform, Text, View, useWindowDimensions} from 'react-native'

import {Space} from '~/ui/Space/Space'

import {useModal} from './ModalContext'

export const Modal = () => {
  const {
    bottomSheetModalRef,
    content,
    height,
    canDiscard,
    footer,
    title,
    resizable,
  } = useModal()
  const {atoms: ta, palette: p, isDark} = useTheme()
  const {height: screenHeight} = useWindowDimensions()
  const [keyboardHeight, setKeyboardHeight] = React.useState(0)

  // Listen to keyboard events when modal is resizable
  React.useEffect(() => {
    if (!resizable) return

    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height)
        // Automatically expand to the keyboard-adjusted height
        setTimeout(() => {
          bottomSheetModalRef?.current?.snapToIndex(1)
        }, 100)
      },
    )
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0)
        // Return to base height when keyboard is dismissed
        setTimeout(() => {
          bottomSheetModalRef?.current?.snapToIndex(0)
        }, 100)
      },
    )

    return () => {
      keyboardDidShowListener?.remove()
      keyboardDidHideListener?.remove()
    }
  }, [resizable, bottomSheetModalRef])

  // TODO: REVISIT make the modal to avoid keyboard
  const snapPoints = React.useMemo(() => {
    if (resizable) {
      const baseHeight = Math.min(height, screenHeight * 0.8)

      if (keyboardHeight > 0) {
        const availableSpace = screenHeight - keyboardHeight - 40
        const keyboardAdjustedHeight = Math.max(
          availableSpace * 0.95,
          baseHeight + 600,
        )
        return [baseHeight, keyboardAdjustedHeight]
      } else {
        const keyboardAdjustedHeight = Math.min(
          baseHeight + 700,
          screenHeight * 0.9,
        )
        return [baseHeight, keyboardAdjustedHeight]
      }
    } else {
      return [height]
    }
  }, [height, screenHeight, resizable, keyboardHeight])

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior={canDiscard ? 'close' : 'none'}
      />
    ),
    [canDiscard],
  )

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={canDiscard}
      enableHandlePanningGesture={resizable}
      enableContentPanningGesture={resizable}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{
        backgroundColor: isDark ? p.gray_50 : p.white_static,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
      }}
      handleIndicatorStyle={{
        backgroundColor: p.gray_max,
        height: 4,
        width: 32,
        borderRadius: 10,
      }}
    >
      <BottomSheetView style={[a.flex_1, a.self_stretch]}>
        {title && (
          <View style={[a.px_lg, a.pt_lg, a.pb_lg]}>
            <Text style={[a.heading_3_medium, ta.text_gray_max, a.text_center]}>
              {title}
            </Text>
          </View>
        )}
        <View style={[a.flex_1, a.self_stretch]}>{content}</View>

        {footer && (
          <View style={[a.px_lg, a.pb_lg, a.pt_md]}>
            {footer}
            <Space.Height.xl />
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  )
}

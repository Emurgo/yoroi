import {atoms as a, useTheme} from '@yoroi/theme'

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import * as React from 'react'
import {Dimensions, Keyboard, Platform, Text, View} from 'react-native'

import {useModal} from './ModalContext'

export const Modal = () => {
  const {bottomSheetModalRef, content, height, canDiscard, footer, title} =
    useModal()
  const {atoms: ta, palette: p, isDark} = useTheme()

  const [keyboardHeight, setKeyboardHeight] = React.useState(0)
  const screenHeight = Dimensions.get('window').height
  const baseHeight = Math.round(screenHeight * 0.4)

  const snapPoints = React.useMemo(() => {
    const minHeight = height || baseHeight

    if (Platform.OS === 'android') {
      return [minHeight, screenHeight * 0.95]
    }

    const adjustedHeight =
      keyboardHeight > 0 ? minHeight + keyboardHeight : minHeight
    const maxHeight = Math.min(adjustedHeight, screenHeight * 0.8)

    return [minHeight, maxHeight]
  }, [height, keyboardHeight, baseHeight, screenHeight])

  React.useEffect(() => {
    if (Platform.OS !== 'ios') return

    const keyboardWillShow = (event: {endCoordinates: {height: number}}) => {
      setKeyboardHeight(event.endCoordinates.height)
      setTimeout(() => {
        bottomSheetModalRef?.current?.snapToIndex(1)
      }, 100)
    }

    const keyboardWillHide = () => {
      setKeyboardHeight(0)
      setTimeout(() => {
        bottomSheetModalRef?.current?.snapToIndex(0)
      }, 100)
    }

    const showSubscription = Keyboard.addListener(
      'keyboardWillShow',
      keyboardWillShow,
    )
    const hideSubscription = Keyboard.addListener(
      'keyboardWillHide',
      keyboardWillHide,
    )

    return () => {
      showSubscription?.remove()
      hideSubscription?.remove()
    }
  }, [bottomSheetModalRef])

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
      keyboardBehavior={Platform.OS === 'android' ? 'extend' : undefined}
      keyboardBlurBehavior={Platform.OS === 'android' ? 'restore' : undefined}
      android_keyboardInputMode="adjustResize"
      enableDynamicSizing={false}
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
      <BottomSheetScrollView
        style={[a.flex_1]}
        contentContainerStyle={[a.gap_lg]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {title && (
          <View style={[a.px_lg, a.pt_lg]}>
            <Text style={[a.heading_3_medium, ta.text_gray_max, a.text_center]}>
              {title}
            </Text>
          </View>
        )}

        <View style={[a.px_lg, a.flex_1]}>{content}</View>

        {footer && <View style={[a.px_lg, a.pb_lg]}>{footer}</View>}
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}

import {atoms as a, useTheme} from '@yoroi/theme'

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import * as React from 'react'
import {Text, View, useWindowDimensions} from 'react-native'

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
    full,
  } = useModal()
  const {atoms: ta, palette: p, isDark} = useTheme()
  const {height: screenHeight} = useWindowDimensions()

  const snapPoints = React.useMemo(() => {
    return full ? ['100%'] : [height]
  }, [full, height])

  const animationConfigs = React.useMemo(() => {
    if (full) {
      return {
        duration: 0,
        easing: 'linear',
      }
    }
    return undefined
  }, [full])

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
      enableHandlePanningGesture={false}
      enableContentPanningGesture={false}
      enableDynamicSizing={false}
      topInset={0}
      bottomInset={0}
      animateOnMount={!full}
      animationConfigs={animationConfigs}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{
        backgroundColor: isDark ? p.gray_50 : p.white_static,
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
      }}
      handleIndicatorStyle={{
        backgroundColor: 'transparent',
        height: 0,
        width: 0,
      }}
      style={{
        marginTop: 0,
      }}
    >
      <BottomSheetView
        style={[a.flex_1, a.self_stretch, full && {minHeight: screenHeight}]}
      >
        {title && (
          <View style={[a.px_lg, a.pt_lg, a.pb_lg]}>
            <Text style={[a.heading_3_medium, ta.text_gray_max, a.text_center]}>
              {title}
            </Text>
          </View>
        )}

        {full ? <View style={[a.flex_1]}>{content}</View> : content}

        {footer ? (
          <View style={[a.px_lg, a.pb_lg, a.pt_md]}>
            {footer}
            <Space.Height.xl />
          </View>
        ) : (
          !full && <Space.Height.xl />
        )}
      </BottomSheetView>
    </BottomSheetModal>
  )
}

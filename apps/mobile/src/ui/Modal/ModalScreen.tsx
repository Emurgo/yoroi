import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useModal} from './ModalContext'

export const Modal = () => {
  const {bottomSheetModalRef, content, height, canDiscard} = useModal()
  const {palette: p, isDark} = useTheme()

  const snapPoints = React.useMemo(() => [height], [height])

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
        {content}
      </BottomSheetView>
    </BottomSheetModal>
  )
}

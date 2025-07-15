import {BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet'
import * as React from 'react'
import {useModal} from './ModalContext'

export const Modal = () => {
  const {bottomSheetModalRef, content} = useModal()
  return (
    <BottomSheetModal ref={bottomSheetModalRef}>
      <BottomSheetView style={{flex: 1}}>{content}</BottomSheetView>
    </BottomSheetModal>
  )
}

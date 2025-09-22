import * as React from 'react'
import {Keyboard} from 'react-native'

import {useIsKeyboardOpen} from '~/hooks/useIsKeyboardOpen'

import {useModal} from './ModalContext'

export const useDismissOrClose = () => {
  const {closeModal} = useModal()
  const isKeyboardOpen = useIsKeyboardOpen()

  return React.useCallback(() => {
    if (isKeyboardOpen) {
      Keyboard.dismiss()
      return
    }
    closeModal()
  }, [closeModal, isKeyboardOpen])
}

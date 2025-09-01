import * as React from 'react'

import {useModal} from '~/ui/Modal/ModalContext'

import {DeepLinkActionHandler} from './DeepLinkActionHandler'

export const DeepLinkActionHandlerWithModal = () => {
  const {openModal, closeModal} = useModal()

  const modalFunctions = React.useMemo(
    () => ({
      openModal,
      closeModal,
    }),
    [openModal, closeModal],
  )

  return <DeepLinkActionHandler modalFunctions={modalFunctions} />
}

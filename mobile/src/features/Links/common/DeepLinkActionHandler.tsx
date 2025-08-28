import * as React from 'react'

import {useLinksRequestAction} from './useLinksRequestAction'

type ModalFunctions = {
  openModal: (args: {
    content: React.ReactNode
    height?: number
    footer?: React.ReactNode
    isLoading?: boolean
    canDiscard?: boolean
    title?: string
    canContinue?: boolean
    onClose?: () => void
    resizable?: boolean
  }) => void
  closeModal: () => void
}

type DeepLinkActionHandlerProps = {
  modalFunctions?: ModalFunctions
}

export const DeepLinkActionHandler = ({
  modalFunctions,
}: DeepLinkActionHandlerProps) => {
  useLinksRequestAction(modalFunctions)

  return null
}

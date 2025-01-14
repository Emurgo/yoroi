import * as React from 'react'

import {useModal} from '../../../../components/Modal/ModalContext'
import {useStrings} from '../../../Discover/common/useStrings'
import {ConfirmRawTxWithOs} from '../../../Swap/common/ConfirmRawTx/ConfirmRawTxWithOs'
import {ConfirmRawTxWithPassword} from '../../../Swap/common/ConfirmRawTx/ConfirmRawTxWithPassword'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'

type PromptRootKeyOptions = {
  onConfirm: (rootKey: string) => Promise<void>
  onClose: () => void
  title?: string
  summary?: string
}

export const usePromptRootKey = () => {
  const {openModal, closeModal} = useModal()
  const {meta} = useSelectedWallet()
  const strings = useStrings()
  const modalHeight = 350

  return React.useCallback(
    ({onConfirm, onClose, title, summary}: PromptRootKeyOptions) => {
      const handleOnConfirm = async (rootKey: string) => {
        const result = await onConfirm(rootKey)
        closeModal()
        return result
      }

      if (meta.isEasyConfirmationEnabled) {
        openModal(title ?? strings.confirmTx, <ConfirmRawTxWithOs onConfirm={handleOnConfirm} />, modalHeight, onClose)
        return
      }

      openModal(
        title ?? strings.confirmTx,
        <ConfirmRawTxWithPassword summary={summary} onConfirm={handleOnConfirm} />,
        modalHeight,
        onClose,
      )
    },
    [meta.isEasyConfirmationEnabled, openModal, strings.confirmTx, closeModal],
  )
}

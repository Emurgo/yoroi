import * as React from 'react'

import {useModal} from '../../../../components/Modal/ModalContext'
import {useStrings} from '../../../Discover/common/useStrings'
import {ConfirmRawTxWithOs} from '../../../Swap/common/ConfirmRawTx/ConfirmRawTxWithOs'
import {ConfirmRawTxWithPassword} from '../../../Swap/common/ConfirmRawTx/ConfirmRawTxWithPassword'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'

type PromptRootKeyOptions = {
  onSuccess: (rootKey: string) => void
  onError?: (error: unknown) => void
  onClose?: () => void
  title?: string
  summary?: string
}

export const usePromptRootKey = () => {
  const {openModal, closeModal} = useModal()
  const {meta} = useSelectedWallet()
  const strings = useStrings()
  const modalHeight = 350

  const promptRootKey = React.useCallback(
    ({onSuccess, onError, onClose, title, summary}: PromptRootKeyOptions) => {
      const handleOnConfirm = (rootKey: string) => {
        const result = onSuccess(rootKey)
        closeModal()
        return result
      }

      if (meta.isEasyConfirmationEnabled) {
        openModal({
          title: title ?? strings.confirmTx,
          content: (
            <ConfirmRawTxWithOs onSuccess={handleOnConfirm} onError={onError} />
          ),
          height: modalHeight,
          onClose,
        })
        return
      }

      openModal({
        title: title ?? strings.confirmTx,
        content: (
          <ConfirmRawTxWithPassword
            summary={summary}
            onConfirm={handleOnConfirm}
          />
        ),
        height: modalHeight,
        onClose,
      })
    },
    [closeModal, meta.isEasyConfirmationEnabled, openModal, strings.confirmTx],
  )

  return {promptRootKey} as const
}

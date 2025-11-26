import * as React from 'react'
import {Keyboard} from 'react-native'

import {ConfirmRawTxWithOs} from '~/features/Swap/common/ConfirmRawTx/ConfirmRawTxWithOs'
import {ConfirmRawTxWithPassword} from '~/features/Swap/common/ConfirmRawTx/ConfirmRawTxWithPassword'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

type PromptRootKeyOptions = {
  onSuccess: (rootKey: string) => void
  onError?: (error: unknown) => void
  onClose?: () => void
  title?: string
  summary?: string
}
const modalHeight = 350

export const usePromptRootKey = () => {
  const {openModal, closeModal} = useModal()
  const {meta} = useSelectedWallet()
  const strings = useStrings()

  const promptRootKey = React.useCallback(
    ({onSuccess, onError, onClose, title, summary}: PromptRootKeyOptions) => {
      const handleOnConfirm = async (rootKey: string) => {
        Keyboard.dismiss()
        closeModal()

        try {
          await onSuccess(rootKey)
        } catch (error) {
          Keyboard.dismiss()
          closeModal()
          onError?.(error)
        }
      }

      const handleOnError = (error?: unknown) => {
        Keyboard.dismiss()
        closeModal()
        onError?.(error)
      }

      if (meta.isEasyConfirmationEnabled) {
        openModal({
          title: title ?? strings.discover.confirmTx,
          content: (
            <Modal.Content>
              <ConfirmRawTxWithOs
                onSuccess={handleOnConfirm}
                onError={handleOnError}
              />
            </Modal.Content>
          ),
          height: modalHeight,
          onClose,
        })
        return
      }

      openModal({
        title: title ?? strings.discover.confirmTx,
        content: (
          <Modal.Content>
            <ConfirmRawTxWithPassword
              summary={summary}
              onConfirm={handleOnConfirm}
              onError={handleOnError}
            />
          </Modal.Content>
        ),
        height: modalHeight,
        onClose,
      })
    },
    [
      closeModal,
      meta.isEasyConfirmationEnabled,
      openModal,
      strings.discover.confirmTx,
    ],
  )

  return {promptRootKey} as const
}

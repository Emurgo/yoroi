import * as React from 'react'

import {ConfirmRawTxWithOs} from '~/features/Swap/common/ConfirmRawTx/ConfirmRawTxWithOs'
import {ConfirmRawTxWithPassword} from '~/features/Swap/common/ConfirmRawTx/ConfirmRawTxWithPassword'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

type PromptRootKeyOptions = {
  onSuccess: (rootKey: string) => void | Promise<void>
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
        try {
          const result = onSuccess(rootKey)
          // If onSuccess returns a Promise, wait for it to complete before closing
          if (result instanceof Promise) {
            await result
          }
          closeModal()
        } catch (error) {
          // If there's an error, don't close the modal - let the error handler deal with it
          if (onError) {
            onError(error)
          }
        }
      }

      if (meta.isEasyConfirmationEnabled) {
        openModal({
          title: title ?? strings.discover.confirmTx,
          content: (
            <Modal.Content>
              <ConfirmRawTxWithOs
                onSuccess={handleOnConfirm}
                onError={onError}
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

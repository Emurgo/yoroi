import {atoms as a} from '@yoroi/theme'

import * as React from 'react'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {ConfirmTxWithOsModal} from '~/ui/ConfirmTxWithOsModal/ConfirmTxWithOsModal'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {YoroiSignedTx, YoroiUnsignedTx} from '~/wallets/types/yoroi'

import {SignWithHwModal} from '../../useCases/ReviewTxScreen/SignWithHwModal/SignWithHwModal'
import {SignWithPasswordModal} from '../../useCases/ReviewTxScreen/SignWithPasswordModal/SignWithPasswordModal'
import {useNavigateTo} from './useNavigateTo'
import {OnConfirm} from './useOnConfirm'

export const useLegacyOnConfirm = ({
  unsignedTx,
  onSuccess,
  onSuccessWithoutFeedback,
  onError,
  onErrorWithoutFeedback,
  onNotSupportedCIP1694,
  onCIP36SupportChange,
}: OnConfirm & {
  unsignedTx?: YoroiUnsignedTx | null
  onNotSupportedCIP1694?: (() => void) | null
  onCIP36SupportChange?: ((isCIP36Supported: boolean) => void) | null
}) => {
  const {meta} = useSelectedWallet()
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  const handleOnSuccess = (signedTx: YoroiSignedTx) => {
    closeModal()
    if (onSuccessWithoutFeedback) {
      onSuccessWithoutFeedback({signedTx})
      return
    }

    if (onSuccess) {
      onSuccess({signedTx})
    }

    navigateTo.showSubmittedTxScreen()
  }
  const handleOnError = (error: unknown) => {
    closeModal()
    if (onErrorWithoutFeedback) {
      onErrorWithoutFeedback(error)
      return
    }

    if (onError) {
      onError(error)
    }
    navigateTo.showFailedTxScreen()
  }

  const legacyOnConfirm = () => {
    if (!unsignedTx) {
      throw new Error('useLegacyOnConfirm:: unsignedTx is required')
    }

    const {isHW, isEasyConfirmationEnabled} = meta

    if (isHW) {
      openModal({
        title: strings.discover.confirmTx,
        content: (
          <Modal.Content>
            <SignWithHwModal
              onCancel={closeModal}
              unsignedTx={unsignedTx}
              onSuccess={handleOnSuccess}
              onNotSupportedCIP1694={() => {
                if (onNotSupportedCIP1694) {
                  closeModal()
                  onNotSupportedCIP1694()
                }
              }}
              onCIP36SupportChange={onCIP36SupportChange ?? undefined}
            />
          </Modal.Content>
        ),
        height: 450,
      })
      return
    }

    if (!isHW && !isEasyConfirmationEnabled) {
      openModal({
        title: strings.discover.confirmTx,
        content: (
          <Modal.Content style={[a.flex_grow]}>
            <SignWithPasswordModal
              unsignedTx={unsignedTx}
              onSuccess={handleOnSuccess}
              onError={handleOnError}
            />
          </Modal.Content>
        ),
        height: 350,
      })
      return
    }

    openModal({
      title: strings.discover.confirmTx,
      content: (
        <Modal.Content>
          <ConfirmTxWithOsModal
            unsignedTx={unsignedTx}
            onSuccess={handleOnSuccess}
            onError={handleOnError}
          />
        </Modal.Content>
      ),
    })
  }

  return {legacyOnConfirm} as const
}

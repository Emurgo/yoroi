import * as React from 'react'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {ConfirmTxWithHwModal} from '~/ui/ConfirmTxWithHwModal/ConfirmTxWithHwModal'
import {ConfirmTxWithOsModal} from '~/ui/ConfirmTxWithOsModal/ConfirmTxWithOsModal'
import {ConfirmTxWithSpendingPasswordModal} from '~/ui/ConfirmTxWithSpendingPasswordModal/ConfirmTxWithSpendingPasswordModal'
import {useModal} from '~/ui/Modal/ModalContext'
import {YoroiSignedTx, YoroiUnsignedTx} from '~/wallets/types/yoroi'
import {useNavigateTo} from './useNavigateTo'
import {OnConfirm} from './useOnConfirm'
import {useStrings} from '~/kernel/i18n/useStrings'

export const useLegacyOnConfirm = ({
  unsignedTx,
  onSuccess,
  onError,
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
    if (onSuccess) {
      onSuccess({signedTx})
      return
    }

    navigateTo.showSubmittedTxScreen()
  }
  const handleOnError = (error: unknown) => {
    if (onError) {
      onError(error)
      return
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
        title: strings.signTransaction,
        content: (
          <ConfirmTxWithHwModal
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
        ),
        height: 400,
      })
      return
    }

    if (!isHW && !isEasyConfirmationEnabled) {
      openModal({
        title: strings.signTransaction,
        content: (
          <ConfirmTxWithSpendingPasswordModal
            unsignedTx={unsignedTx}
            onSuccess={handleOnSuccess}
            onError={handleOnError}
          />
        ),
        height: 400,
      })
      return
    }

    openModal({
      title: strings.signTransaction,
      content: (
        <ConfirmTxWithOsModal
          unsignedTx={unsignedTx}
          onSuccess={handleOnSuccess}
          onError={handleOnError}
        />
      ),
    })
  }

  return {legacyOnConfirm} as const
}

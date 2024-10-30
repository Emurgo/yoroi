import * as React from 'react'

import {ConfirmTxWithHwModal} from '../../../../components/ConfirmTxWithHwModal/ConfirmTxWithHwModal'
import {ConfirmTxWithOsModal} from '../../../../components/ConfirmTxWithOsModal/ConfirmTxWithOsModal'
import {ConfirmTxWithSpendingPasswordModal} from '../../../../components/ConfirmTxWithSpendingPasswordModal/ConfirmTxWithSpendingPasswordModal'
import {useModal} from '../../../../components/Modal/ModalContext'
import {YoroiSignedTx, YoroiUnsignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateTo} from './useNavigateTo'
import {useStrings} from './useStrings'

// TODO: make it compatible with CBOR signing
export const useOnConfirm = ({
  unsignedTx,
  onSuccess,
  onError,
  onNotSupportedCIP1694,
  onCIP36SupportChange,
}: {
  onSuccess?: ((txId: YoroiSignedTx) => void) | null
  onError?: (() => void) | null
  cbor?: string
  unsignedTx?: YoroiUnsignedTx | null
  onNotSupportedCIP1694?: (() => void) | null
  onCIP36SupportChange?: ((isCIP36Supported: boolean) => void) | null
}) => {
  const {meta} = useSelectedWallet()
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  const handleOnSuccess = (signedTx: YoroiSignedTx) => {
    onSuccess?.(signedTx)
    navigateTo.showSubmittedTxScreen()
  }
  const handleOnError = () => {
    onError?.()
    navigateTo.showFailedTxScreen()
  }

  const onConfirm = () => {
    if (meta.isHW && unsignedTx) {
      openModal(
        strings.signTransaction,
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
        />,
        400,
      )
      return
    }

    if (!meta.isHW && !meta.isEasyConfirmationEnabled && unsignedTx) {
      openModal(
        strings.signTransaction,
        <ConfirmTxWithSpendingPasswordModal
          unsignedTx={unsignedTx}
          onSuccess={handleOnSuccess}
          onError={handleOnError}
        />,
      )
      return
    }

    if (!meta.isHW && meta.isEasyConfirmationEnabled && unsignedTx) {
      openModal(
        strings.signTransaction,
        <ConfirmTxWithOsModal unsignedTx={unsignedTx} onSuccess={handleOnSuccess} onError={handleOnError} />,
      )
      return
    }
  }

  return {onConfirm} as const
}

import * as React from 'react'

import {ConfirmTxWithHwModal} from '../../../../components/ConfirmTxWithHwModal/ConfirmTxWithHwModal'
import {ConfirmTxWithOsModal} from '../../../../components/ConfirmTxWithOsModal/ConfirmTxWithOsModal'
import {ConfirmTxWithSpendingPasswordModal} from '../../../../components/ConfirmTxWithSpendingPasswordModal/ConfirmTxWithSpendingPasswordModal'
import {useModal} from '../../../../components/Modal/ModalContext'
import {YoroiSignedTx, YoroiUnsignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from './useStrings'

// TODO: make it compatible with CBOR signing
export const useOnConfirm = ({
  unsignedTx,
  onSuccess,
  onError,
  onNotSupportedCIP1694,
}: {
  onSuccess: (txId: YoroiSignedTx) => void
  onError: () => void
  cbor?: string
  unsignedTx?: YoroiUnsignedTx
  onNotSupportedCIP1694?: () => void
}) => {
  if (unsignedTx === undefined) throw new Error('useOnConfirm: unsignedTx missing')

  const {meta} = useSelectedWallet()
  const {openModal, closeModal} = useModal()
  const strings = useStrings()

  const onConfirm = () => {
    if (meta.isHW) {
      openModal(
        strings.signTransaction,
        <ConfirmTxWithHwModal
          onCancel={closeModal}
          unsignedTx={unsignedTx}
          onSuccess={(signedTx) => onSuccess(signedTx)}
          onNotSupportedCIP1694={onNotSupportedCIP1694}
        />,
        400,
      )
      return
    }

    if (!meta.isHW && !meta.isEasyConfirmationEnabled) {
      openModal(
        strings.signTransaction,
        <ConfirmTxWithSpendingPasswordModal
          unsignedTx={unsignedTx}
          onSuccess={(signedTx) => onSuccess(signedTx)}
          onError={onError}
        />,
      )
      return
    }

    if (!meta.isHW && meta.isEasyConfirmationEnabled) {
      openModal(
        strings.signTransaction,
        <ConfirmTxWithOsModal
          unsignedTx={unsignedTx}
          onSuccess={(signedTx) => onSuccess(signedTx)}
          onError={onError}
        />,
      )
      return
    }
  }

  return {onConfirm}
}

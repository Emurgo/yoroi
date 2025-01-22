import {Transaction} from '@emurgo/cross-csl-core'

import {YoroiSignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateTo} from './useNavigateTo'
import {usePromptRootKey} from './usePromptRootKey'
import {useSignTxWithHW} from './useSignTxWithHW'

export type OnConfirm = {
  cbor?: string | null
  partial?: boolean
  onSuccess?: (args?: {tx?: Transaction; rootKey?: string; signedTx?: YoroiSignedTx}) => void
  onError?: ((error: unknown) => void) | null
  onCancel?: () => void
  onClose?: () => void
}

export const useOnConfirm = ({cbor, partial, onSuccess, onError, onCancel, onClose}: OnConfirm) => {
  const {meta} = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const {sign} = useSignTxWithHW()
  const {promptRootKey} = usePromptRootKey()

  const handleOnSuccess = ({rootKey, tx}: {tx?: Transaction; rootKey?: string}) => {
    if (onSuccess) {
      onSuccess({rootKey, tx})
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

  const onConfirm = () => {
    if (meta.isHW && cbor != null) {
      sign({
        cbor,
        partial,
        onCancel,
        onClose,
        onSuccess: (tx: Transaction) => handleOnSuccess({tx}),
        onError: handleOnError,
      })
      return
    }

    if (!meta.isHW) {
      promptRootKey({
        onSuccess: (rootKey: string) => handleOnSuccess({rootKey}),
        onError: handleOnError,
        onClose,
      })
      return
    }

    throw new Error('useOnConfirm:: invalid state')
  }

  return {onConfirm} as const
}

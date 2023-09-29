import React from 'react'

import {WrongPassword} from '../../../../yoroi-wallets/cardano/errors'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useSignWithPasswordAndSubmitTx} from '../../../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {ConfirmWithSpendingPassword} from '../../common/ConfirmWithSpendingPassword'
import {useStrings} from '../../common/strings'

type ErrorData = {
  errorMessage: string
  errorLogs?: unknown
}

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onSuccess: () => void
  onCancel?: () => void
}

export const ConfirmTxWithPassword = ({wallet, onSuccess, unsignedTx}: Props) => {
  const [errorData, setErrorData] = React.useState<ErrorData>({
    errorMessage: '',
    errorLogs: '',
  })
  const strings = useStrings()

  const {signAndSubmitTx, isLoading} = useSignWithPasswordAndSubmitTx(
    {wallet}, //
    {submitTx: {onSuccess}},
  )

  const showError = ({errorMessage, errorLogs}: ErrorData) => {
    setErrorData({
      errorMessage,
      errorLogs,
    })
  }

  const onConfirm = async (password: string) => {
    try {
      const rootKey = await wallet.encryptedStorage.rootKey.read(password)
      if (rootKey !== undefined) {
        signAndSubmitTx({unsignedTx, password})
      }
    } catch (err) {
      if (err instanceof WrongPassword) {
        showError({
          errorMessage: strings.incorrectPasswordTitle,
          errorLogs: strings.incorrectPasswordMessage,
        })
      } else {
        showError({
          errorMessage: strings.generalTxErrorMessage,
          errorLogs: err,
        })
      }
    }
  }

  return (
    <ConfirmWithSpendingPassword
      onSubmit={onConfirm}
      isLoading={isLoading}
      error={errorData.errorMessage.length > 0 ? new Error(errorData.errorMessage) : undefined}
    />
  )
}

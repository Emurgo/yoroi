import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert} from 'react-native'

import {useAuthOsErrorDecoder, useAuthOsWithEasyConfirmation} from '../../../auth'
import {TwoActionView} from '../../../components'
import {LoadingOverlay} from '../../../components/LoadingOverlay'
import {useSignAndSubmitTx} from '../../../hooks'
import globalMessages, {confirmationMessages, txLabels} from '../../../i18n/global-messages'
import {isEmptyString} from '../../../legacy/utils'
import {YoroiWallet} from '../../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {TransferSummary} from '../TransferSummary'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: () => void
}

export const ConfirmTxWithOS = ({wallet, unsignedTx, onSuccess, onCancel}: Props) => {
  const strings = useStrings()
  const decodeAuthOsError = useAuthOsErrorDecoder()
  const {authWithOs, isLoading: authenticating} = useAuthOsWithEasyConfirmation(
    {
      id: wallet.id,
      authenticationPrompt: {
        title: strings.authorize,
        cancel: strings.cancel,
      },
    },
    {
      onSuccess: (rootKey) => signAndSubmitTx({unsignedTx, rootKey}),
      onError: (error) => {
        const errorMessage = decodeAuthOsError(error)
        if (!isEmptyString(errorMessage)) Alert.alert(strings.error, errorMessage)
      },
    },
  )

  const {signAndSubmitTx, isLoading: processingTx} = useSignAndSubmitTx(
    {wallet},
    {
      signTx: {useErrorBoundary: true},
      submitTx: {onSuccess, useErrorBoundary: true},
    },
  )

  const isLoading = authenticating || processingTx

  return (
    <>
      <TwoActionView
        title={strings.confirmTx}
        primaryButton={{
          disabled: isLoading,
          label: strings.confirmButton,
          onPress: () => authWithOs(),
        }}
        secondaryButton={{
          disabled: isLoading,
          onPress: () => onCancel(),
        }}
      >
        <TransferSummary wallet={wallet} unsignedTx={unsignedTx} />
      </TwoActionView>

      <LoadingOverlay loading={isLoading} />
    </>
  )
}

const messages = defineMessages({
  authorize: {
    id: 'components.send.biometricauthscreen.authorizeOperation',
    defaultMessage: '!!!Authorize',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    error: intl.formatMessage(globalMessages.error),
    authorize: intl.formatMessage(messages.authorize),
    cancel: intl.formatMessage(globalMessages.cancel),
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    confirmTx: intl.formatMessage(txLabels.confirmTx),
    password: intl.formatMessage(txLabels.password),
  }
}

import React from 'react'
import {useIntl} from 'react-intl'

import {TwoActionView} from '../../../components'
import {LoadingOverlay} from '../../../components/LoadingOverlay'
import {confirmationMessages, txLabels} from '../../../i18n/global-messages'
import {useSignAndSubmitTx} from '../../../yoroi-wallets'
import {useAuthOsWithEasyConfirmation, YoroiWallet} from '../../../yoroi-wallets'
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

  const {authWithOs, isLoading: authenticating} = useAuthOsWithEasyConfirmation(
    {id: wallet.id},
    {onSuccess: (rootKey) => signAndSubmitTx({unsignedTx, rootKey})},
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

const useStrings = () => {
  const intl = useIntl()

  return {
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    confirmTx: intl.formatMessage(txLabels.confirmTx),
  }
}

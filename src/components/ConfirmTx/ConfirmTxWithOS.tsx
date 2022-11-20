import React from 'react'
import {useIntl} from 'react-intl'

import {useAuthOsWithEasyConfirmation} from '../../auth'
import {Button, LoadingOverlay} from '../../components'
import {useSignAndSubmitTx} from '../../hooks'
import {actionMessages} from '../../i18n/global-messages'
import {YoroiWallet} from '../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../yoroi-wallets/types'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onSuccess: () => void
}

export const ConfirmTxWithOS = ({wallet, unsignedTx, onSuccess}: Props) => {
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
      <Button title={strings.sendButton} onPress={() => authWithOs()} shelleyTheme disabled={isLoading} />

      <LoadingOverlay loading={isLoading} />
    </>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    sendButton: intl.formatMessage(actionMessages.send),
  }
}

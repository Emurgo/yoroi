import React from 'react'
import {useIntl} from 'react-intl'

import {useAuthOsWithEasyConfirmation} from '../../auth'
import {useSignAndSubmitTx} from '../../hooks'
import {actionMessages} from '../../i18n/global-messages'
import {YoroiWallet} from '../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {Button} from '../Button'
import {LoadingOverlay} from '../LoadingOverlay'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onSuccess: () => void
}

export const ConfirmTxWithOSAndSubmit = ({wallet, unsignedTx, onSuccess}: Props) => {
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

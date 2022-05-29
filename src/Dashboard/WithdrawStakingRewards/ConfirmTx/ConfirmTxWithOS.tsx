import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useIntl} from 'react-intl'

import {TwoActionView} from '../../../components'
import {useSignAndSubmitTx} from '../../../hooks'
import {confirmationMessages, errorMessages, txLabels} from '../../../i18n/global-messages'
import {showErrorDialog} from '../../../legacy/actions'
import {ensureKeysValidity} from '../../../legacy/deviceSettings'
import {useSelectedWallet} from '../../../SelectedWallet'
import {SystemAuthDisabled, walletManager} from '../../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {TransferSummary} from '../WithdrawalDialog/TransferSummary'

type Props = {
  onCancel: () => void
  onSuccess: () => void
  yoroiUnsignedTx: YoroiUnsignedTx
}

export const ConfirmTxWithOS: React.FC<Props> = ({yoroiUnsignedTx, onSuccess, onCancel}) => {
  const wallet = useSelectedWallet()
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation()

  const {signAndSubmitTx} = useSignAndSubmitTx(
    {wallet},
    {
      signTx: {
        onError: async (error) => {
          if (error instanceof SystemAuthDisabled) {
            onCancel()
            await walletManager.closeWallet()
            await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
            navigation.navigate('app-root', {screen: 'wallet-selection'})
          }
        },
      },
      submitTx: {onSuccess},
    },
  )

  return (
    <TwoActionView
      title={strings.confirmTx}
      primaryButton={{
        label: strings.confirmButton,
        onPress: async () => {
          await ensureKeysValidity(wallet.id)
          navigation.navigate('biometrics', {
            keyId: wallet.id,
            onSuccess: async (masterKey) => signAndSubmitTx({yoroiUnsignedTx, masterKey}),
            onFail: () => navigation.goBack(),
          })
        },
      }}
      secondaryButton={{
        onPress: () => onCancel(),
      }}
    >
      <TransferSummary yoroiUnsignedTx={yoroiUnsignedTx} />
    </TwoActionView>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    confirmTx: intl.formatMessage(txLabels.confirmTx),
    password: intl.formatMessage(txLabels.password),
  }
}

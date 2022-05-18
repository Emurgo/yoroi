import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useIntl} from 'react-intl'
import {useSelector} from 'react-redux'

import {TwoActionView} from '../../../components'
import {useSignTx, useSubmitTx, useWithdrawalTx} from '../../../hooks'
import {confirmationMessages, errorMessages, txLabels} from '../../../i18n/global-messages'
import {showErrorDialog} from '../../../legacy/actions'
import {ensureKeysValidity} from '../../../legacy/deviceSettings'
import {serverStatusSelector, utxosSelector} from '../../../legacy/selectors'
import {useSelectedWallet} from '../../../SelectedWallet'
import {SystemAuthDisabled, walletManager} from '../../../yoroi-wallets'
import {Staked} from '../../StakePoolInfos'
import {TransferSummary} from '../WithdrawalDialog/TransferSummary'

type Props = {
  onCancel: () => void
  onSuccess: () => void
  stakingInfo: Staked
  shouldDeregister: boolean
}

export const ConfirmTxWithOS: React.FC<Props> = ({onSuccess, onCancel, shouldDeregister}) => {
  const wallet = useSelectedWallet()
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation()
  const utxos = useSelector(utxosSelector) || []
  const serverStatus = useSelector(serverStatusSelector)

  const {withdrawalTx} = useWithdrawalTx({
    wallet,
    utxos,
    shouldDeregister,
    serverTime: serverStatus.serverTime,
  })

  const {signTx} = useSignTx(
    {wallet},
    {
      onSuccess: (signedTx) => submitTx(signedTx),
      onError: async (error) => {
        if (error instanceof SystemAuthDisabled) {
          onCancel()
          await walletManager.closeWallet()
          await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
          navigation.navigate('app-root', {screen: 'wallet-selection'})
        }
      },
    },
  )

  const {submitTx} = useSubmitTx({wallet}, {onSuccess})

  return (
    <TwoActionView
      title={strings.confirmTx}
      primaryButton={{
        label: strings.confirmButton,
        onPress: async () => {
          await ensureKeysValidity(wallet.id)
          navigation.navigate('biometrics', {
            keyId: wallet.id,
            onSuccess: async (masterKey) => signTx({yoroiUnsignedTx: withdrawalTx, masterKey}),
            onFail: () => navigation.goBack(),
          })
        },
      }}
      secondaryButton={{
        onPress: () => onCancel(),
      }}
    >
      <TransferSummary withdrawalTx={withdrawalTx} />
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

import React from 'react'
import {useIntl} from 'react-intl'
import {useSelector} from 'react-redux'

import {TextInput, TwoActionView} from '../../../components'
import {useSignTxWithPassword, useSubmitTx, useWithdrawalTx} from '../../../hooks'
import {confirmationMessages, txLabels} from '../../../i18n/global-messages'
import {CONFIG} from '../../../legacy/config'
import {serverStatusSelector, utxosSelector} from '../../../legacy/selectors'
import {useSelectedWallet} from '../../../SelectedWallet'
import {Staked} from '../../StakePoolInfos'
import {TransferSummary} from '../WithdrawalDialog/TransferSummary'

type Props = {
  onCancel: () => void
  onSuccess: () => void
  stakingInfo: Staked
  shouldDeregister: boolean
}

export const ConfirmTxWithPassword: React.FC<Props> = ({onSuccess, onCancel, shouldDeregister}) => {
  const wallet = useSelectedWallet()
  const intl = useIntl()
  const strings = useStrings()
  const [password, setPassword] = React.useState(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')
  const utxos = useSelector(utxosSelector) || []
  const serverStatus = useSelector(serverStatusSelector)

  const {withdrawalTx} = useWithdrawalTx({
    wallet,
    utxos,
    shouldDeregister,
    serverTime: serverStatus.serverTime,
  })
  const {signTx, isLoading} = useSignTxWithPassword(
    {wallet},
    {onSuccess: (signedTx) => submitTx(signedTx), useErrorBoundary: true},
  )
  const {submitTx} = useSubmitTx({wallet}, {onSuccess})

  return (
    <TwoActionView
      title={strings.confirmTx}
      primaryButton={{
        disabled: isLoading || !withdrawalTx,
        label: strings.confirmButton,
        onPress: () => signTx({yoroiUnsignedTx: withdrawalTx, password, intl}),
      }}
      secondaryButton={{
        disabled: isLoading,
        onPress: () => onCancel(),
      }}
    >
      <TransferSummary withdrawalTx={withdrawalTx} />

      <PasswordInput onChangeText={setPassword} secureTextEntry value={password} label={strings.password} />
    </TwoActionView>
  )
}

const PasswordInput = TextInput

const useStrings = () => {
  const intl = useIntl()

  return {
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    confirmTx: intl.formatMessage(txLabels.confirmTx),
    password: intl.formatMessage(txLabels.password),
  }
}

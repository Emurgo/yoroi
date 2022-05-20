import React from 'react'
import {useIntl} from 'react-intl'

import {TextInput, TwoActionView} from '../../../components'
import {useSignWithPasswordAndSubmitTx} from '../../../hooks'
import {confirmationMessages, txLabels} from '../../../i18n/global-messages'
import {CONFIG} from '../../../legacy/config'
import {useSelectedWallet} from '../../../SelectedWallet'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {TransferSummary} from '../WithdrawalDialog/TransferSummary'

type Props = {
  onCancel: () => void
  onSuccess: () => void
  yoroiUnsignedTx: YoroiUnsignedTx
}

export const ConfirmTxWithPassword: React.FC<Props> = ({onSuccess, onCancel, yoroiUnsignedTx}) => {
  const wallet = useSelectedWallet()
  const intl = useIntl()
  const strings = useStrings()
  const [password, setPassword] = React.useState(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')

  const {signAndSubmitTx, isLoading} = useSignWithPasswordAndSubmitTx(
    {wallet}, //
    {submitTx: {onSuccess}},
  )

  return (
    <TwoActionView
      title={strings.confirmTx}
      primaryButton={{
        disabled: isLoading || !yoroiUnsignedTx,
        label: strings.confirmButton,
        onPress: () => signAndSubmitTx({yoroiUnsignedTx, password, intl}),
      }}
      secondaryButton={{
        disabled: isLoading,
        onPress: () => onCancel(),
      }}
    >
      <TransferSummary yoroiUnsignedTx={yoroiUnsignedTx} />

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

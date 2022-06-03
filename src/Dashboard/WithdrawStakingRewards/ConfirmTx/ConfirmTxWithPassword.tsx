import React from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, View} from 'react-native'

import {TextInput, TwoActionView} from '../../../components'
import {useSignWithPasswordAndSubmitTx} from '../../../hooks'
import {confirmationMessages, txLabels} from '../../../i18n/global-messages'
import {CONFIG} from '../../../legacy/config'
import KeyStore from '../../../legacy/KeyStore'
import {YoroiWallet} from '../../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {TransferSummary} from '../WithdrawalDialog/TransferSummary'

type Props = {
  wallet: YoroiWallet
  storage: typeof KeyStore
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: () => void
}

export const ConfirmTxWithPassword: React.FC<Props> = ({wallet, storage, onSuccess, onCancel, unsignedTx}) => {
  const intl = useIntl()
  const strings = useStrings()
  const [password, setPassword] = React.useState(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')

  const {signAndSubmitTx, isLoading} = useSignWithPasswordAndSubmitTx(
    {wallet, storage}, //
    {submitTx: {onSuccess}},
  )

  return (
    <>
      <TwoActionView
        title={strings.confirmTx}
        primaryButton={{
          disabled: isLoading,
          label: strings.confirmButton,
          onPress: () => signAndSubmitTx({unsignedTx, password, intl}),
        }}
        secondaryButton={{
          disabled: isLoading,
          onPress: () => onCancel(),
        }}
      >
        <TransferSummary wallet={wallet} unsignedTx={unsignedTx} />

        <PasswordInput
          autoFocus
          onChangeText={setPassword}
          secureTextEntry
          value={password}
          label={strings.password}
          disabled={isLoading}
        />
      </TwoActionView>

      {isLoading && (
        <View
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
    </>
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

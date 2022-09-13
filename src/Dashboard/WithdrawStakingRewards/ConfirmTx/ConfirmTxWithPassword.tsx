import {YoroiUnsignedTx, YoroiWallet} from '@yoroi-wallets'
import {CONFIG} from '@yoroi-wallets'
import React from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, View} from 'react-native'

import {TextInput, TwoActionView} from '../../../components'
import {useSignWithPasswordAndSubmitTx} from '../../../hooks'
import {confirmationMessages, txLabels} from '../../../i18n/global-messages'
import KeyStore from '../../../legacy/KeyStore'
import {TransferSummary} from '../TransferSummary'

type Props = {
  wallet: YoroiWallet
  storage: typeof KeyStore
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: () => void
}

export const ConfirmTxWithPassword = ({wallet, storage, onSuccess, onCancel, unsignedTx}: Props) => {
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
          testID: 'confirmTxButton',
        }}
        secondaryButton={{
          disabled: isLoading,
          onPress: () => onCancel(),
          testID: 'cancelTxButton',
        }}
      >
        <TransferSummary wallet={wallet} unsignedTx={unsignedTx} />

        <PasswordInput
          autoComplete={false}
          autoFocus
          onChangeText={setPassword}
          secureTextEntry
          value={password}
          label={strings.password}
          disabled={isLoading}
          testID="walletPasswordInput"
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

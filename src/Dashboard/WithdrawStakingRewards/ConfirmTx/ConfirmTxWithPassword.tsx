import React from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, View} from 'react-native'

import {RootKey} from '../../../auth'
import {TextInput, TwoActionView} from '../../../components'
import {useSignWithPasswordAndSubmitTx} from '../../../hooks'
import {confirmationMessages, txLabels} from '../../../i18n/global-messages'
import {CONFIG} from '../../../legacy/config'
import {YoroiWallet} from '../../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {TransferSummary} from '../TransferSummary'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: () => void
  rootKey: RootKey
}

export const ConfirmTxWithPassword = ({wallet, onSuccess, onCancel, unsignedTx, rootKey}: Props) => {
  const strings = useStrings()
  const [password, setPassword] = React.useState(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')

  const {signAndSubmitTx, isLoading} = useSignWithPasswordAndSubmitTx(
    {wallet, rootKey}, //
    {submitTx: {onSuccess}},
  )

  return (
    <>
      <TwoActionView
        title={strings.confirmTx}
        primaryButton={{
          disabled: isLoading,
          label: strings.confirmButton,
          onPress: () => signAndSubmitTx({unsignedTx, password}),
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

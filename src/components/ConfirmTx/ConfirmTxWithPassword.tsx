import * as React from 'react'
import {useIntl} from 'react-intl'
import {
  Keyboard,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native'

import {Button, LoadingOverlay, TextInput} from '../../components'
import {useSignWithPasswordAndSubmitTx} from '../../hooks'
import {confirmationMessages, errorMessages, txLabels} from '../../i18n/global-messages'
import {CONFIG} from '../../legacy/config'
import {WrongPassword} from '../../legacy/errors'
import {YoroiWallet} from '../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {REQUIRED_PASSWORD_LENGTH} from '../../yoroi-wallets/utils/validators'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onSuccess: () => void
}

export const ConfirmTxWithPassword = ({wallet, onSuccess, unsignedTx}: Props) => {
  const strings = useStrings()
  const [password, setPassword] = React.useState(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')

  const {signAndSubmitTx, isLoading, error} = useSignWithPasswordAndSubmitTx(
    {wallet}, //
    {signTx: {useErrorBoundary: (error) => !(error instanceof WrongPassword)}, submitTx: {onSuccess}},
  )

  return (
    <>
      <AvoidKeyboard>
        <>
          <PasswordInput
            autoComplete={false}
            onChangeText={setPassword}
            secureTextEntry
            value={password}
            label={strings.password}
            disabled={isLoading}
            testID="walletPasswordInput"
            errorText={error != null ? strings.incorrectPassword : undefined}
            error={error != null}
          />

          <Button
            title={strings.confirmButton}
            onPress={() => signAndSubmitTx({unsignedTx, password})}
            shelleyTheme
            disabled={password.length < REQUIRED_PASSWORD_LENGTH || isLoading}
            testID="confirmTxButton"
          />
        </>
      </AvoidKeyboard>

      <LoadingOverlay loading={isLoading} />
    </>
  )
}

const AvoidKeyboard = ({children, ...props}: KeyboardAvoidingViewProps) => (
  <KeyboardAvoidingView
    {...props}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>{children}</TouchableWithoutFeedback>
  </KeyboardAvoidingView>
)

const useStrings = () => {
  const intl = useIntl()

  return {
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    incorrectPassword: intl.formatMessage(errorMessages.incorrectPassword.title),
    confirmTx: intl.formatMessage(txLabels.confirmTx),
    password: intl.formatMessage(txLabels.password),
  }
}

const PasswordInput = TextInput

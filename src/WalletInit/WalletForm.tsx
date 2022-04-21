import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, TextInput as RNTextInput, View} from 'react-native'

import {Button, Checkmark, Spacer, TextInput} from '../components'
import {useWalletNames} from '../hooks'
import globalMessages from '../i18n/global-messages'
import {CONFIG} from '../legacy/config'
import {COLORS} from '../theme'
import {
  getWalletNameError,
  REQUIRED_PASSWORD_LENGTH,
  validatePassword,
  validateWalletName,
} from '../yoroi-wallets/utils/validators'

type Props = {
  onSubmit: (credentials: {name: string; password: string}) => void
}

export const WalletForm = ({onSubmit}: Props) => {
  const strings = useStrings()
  const walletNames = useWalletNames()
  const [name, setName] = React.useState(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.WALLET_NAME : '')
  const nameErrors = validateWalletName(name, null, walletNames || [])
  const walletNameErrorText =
    getWalletNameError(
      {tooLong: strings.tooLong, nameAlreadyTaken: strings.nameAlreadyTaken, mustBeFilled: strings.mustBeFilled},
      nameErrors,
    ) || undefined

  const passwordRef = React.useRef<RNTextInput>(null)
  const [password, setPassword] = React.useState(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')

  const passwordConfirmationRef = React.useRef<RNTextInput>(null)
  const [passwordConfirmation, setPasswordConfirmation] = React.useState(
    CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '',
  )
  const passwordErrors = validatePassword(password, passwordConfirmation)
  const passwordErrorText = passwordErrors.passwordIsWeak
    ? strings.passwordStrengthRequirement({requiredPasswordLength: REQUIRED_PASSWORD_LENGTH})
    : undefined
  const passwordConfirmationErrorText = passwordErrors.matchesConfirmation
    ? strings.repeatPasswordInputError
    : undefined

  return (
    <View style={styles.safeAreaView}>
      <ScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.scrollContentContainer}
        testID="credentialsView"
        bounces={false}
      >
        <WalletNameInput
          enablesReturnKeyAutomatically
          autoFocus
          label={strings.walletNameInputLabel}
          value={name}
          onChangeText={setName}
          errorText={walletNameErrorText}
          errorDelay={0}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          testID="walletNameInput"
          autoComplete={false}
        />

        <Spacer />

        <PasswordInput
          enablesReturnKeyAutomatically
          ref={passwordRef}
          secureTextEntry
          label={strings.newPasswordInput}
          value={password}
          onChangeText={setPassword}
          errorText={passwordErrorText}
          returnKeyType="next"
          helperText={strings.passwordStrengthRequirement({
            requiredPasswordLength: REQUIRED_PASSWORD_LENGTH,
          })}
          right={!passwordErrors.passwordIsWeak ? <Checkmark /> : undefined}
          onSubmitEditing={() => passwordConfirmationRef.current?.focus()}
          testID="walletPasswordInput"
          autoComplete={false}
        />

        <Spacer />

        <PasswordConfirmationInput
          enablesReturnKeyAutomatically
          ref={passwordConfirmationRef}
          secureTextEntry
          returnKeyType="done"
          label={strings.repeatPasswordInputLabel}
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          errorText={passwordConfirmationErrorText}
          right={
            !passwordErrors.matchesConfirmation && !passwordErrors.passwordConfirmationReq ? <Checkmark /> : undefined
          }
          testID="walletRepeatPasswordInput"
          autoComplete={false}
        />
      </ScrollView>

      <Actions>
        <Button
          onPress={() => onSubmit({name, password})}
          disabled={Object.keys(passwordErrors).length > 0 || Object.keys(nameErrors).length > 0}
          title={strings.continueButton}
          testID="walletFormContinueButton"
        />
      </Actions>
    </View>
  )
}

const WalletNameInput = TextInput
const PasswordInput = TextInput
const PasswordConfirmationInput = TextInput
const Actions = (props) => <View {...props} style={styles.actions} />

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  actions: {
    padding: 16,
    backgroundColor: COLORS.BACKGROUND,
  },
})

const messages = defineMessages({
  walletNameInputLabel: {
    id: 'components.walletinit.walletform.walletNameInputLabel',
    defaultMessage: '!!!Wallet name',
  },
  newPasswordInput: {
    id: 'components.walletinit.walletform.newPasswordInput',
    defaultMessage: '!!!Spending password',
  },
  continueButton: {
    id: 'components.walletinit.walletform.continueButton',
    defaultMessage: '!!!Continue',
  },
  passwordStrengthRequirement: {
    id: 'components.walletinit.createwallet.createwalletscreen.passwordLengthRequirement',
    defaultMessage: '!!!Minimum characters',
  },
  repeatPasswordInputLabel: {
    id: 'components.walletinit.walletform.repeatPasswordInputLabel',
    defaultMessage: '!!!Repeat password',
  },
  repeatPasswordInputError: {
    id: 'components.walletinit.walletform.repeatPasswordInputError',
    defaultMessage: '!!!Passwords do not match',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    walletNameInputLabel: intl.formatMessage(messages.walletNameInputLabel),
    newPasswordInput: intl.formatMessage(messages.newPasswordInput),
    continueButton: intl.formatMessage(messages.continueButton),
    passwordStrengthRequirement: (options) => intl.formatMessage(messages.passwordStrengthRequirement, options),
    repeatPasswordInputLabel: intl.formatMessage(messages.repeatPasswordInputLabel),
    repeatPasswordInputError: intl.formatMessage(messages.repeatPasswordInputError),
    tooLong: intl.formatMessage(globalMessages.walletNameErrorTooLong),
    nameAlreadyTaken: intl.formatMessage(globalMessages.walletNameErrorNameAlreadyTaken),
    mustBeFilled: intl.formatMessage(globalMessages.walletNameErrorMustBeFilled),
  }
}

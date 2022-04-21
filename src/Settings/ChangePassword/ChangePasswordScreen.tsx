import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, TextInput as RNTextInput, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {MutationOptions, useMutation} from 'react-query'

import {Button, Checkmark, Spacer, TextInput} from '../../components'
import {errorMessages} from '../../i18n/global-messages'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {YoroiWallet} from '../../yoroi-wallets'
import {REQUIRED_PASSWORD_LENGTH, validatePassword} from '../../yoroi-wallets/utils/validators'

export const ChangePasswordScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation()

  const currentPasswordRef = React.useRef<RNTextInput>(null)
  const [currentPassword, setCurrentPassword] = React.useState('')
  const currentPasswordErrors = currentPassword.length === 0 ? {currentPasswordRequired: true} : {}

  const newPasswordRef = React.useRef<RNTextInput>(null)
  const [newPassword, setNewPassword] = React.useState('')

  const newPasswordConfirmationRef = React.useRef<RNTextInput>(null)
  const [newPasswordConfirmation, setNewPasswordConfirmation] = React.useState('')
  const newPasswordErrors = validatePassword(newPassword, newPasswordConfirmation)

  const hasErrors = Object.keys(currentPasswordErrors).length > 0 || Object.keys(newPasswordErrors).length > 0

  const wallet = useSelectedWallet()
  const {changePassword, isError, reset} = useChangePassword(wallet, {
    onSuccess: () => navigation.goBack(),
    onError: () => currentPasswordRef.current?.focus(),
  })

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ScrollView bounces={false} keyboardDismissMode="on-drag" contentContainerStyle={styles.contentContainer}>
        <CurrentPasswordInput
          ref={currentPasswordRef}
          enablesReturnKeyAutomatically
          autoFocus
          secureTextEntry
          label={strings.oldPasswordInputLabel}
          value={currentPassword}
          onChange={reset}
          onChangeText={setCurrentPassword}
          returnKeyType="next"
          onSubmitEditing={() => newPasswordRef.current?.focus()}
          errorText={isError ? strings.incorrectPassword : undefined}
          autoComplete={false}
        />

        <Spacer />

        <PasswordInput
          ref={newPasswordRef}
          enablesReturnKeyAutomatically
          secureTextEntry
          label={strings.newPasswordInputLabel}
          value={newPassword}
          onChangeText={setNewPassword}
          errorText={newPasswordErrors.passwordIsWeak ? strings.passwordStrengthRequirement : undefined}
          helperText={strings.passwordStrengthRequirement}
          returnKeyType="next"
          onSubmitEditing={() => newPasswordConfirmationRef.current?.focus()}
          right={!newPasswordErrors.passwordIsWeak ? <Checkmark /> : undefined}
          autoComplete={false}
        />

        <Spacer />

        <PasswordConfirmationInput
          ref={newPasswordConfirmationRef}
          enablesReturnKeyAutomatically
          secureTextEntry
          label={strings.repeatPasswordInputLabel}
          value={newPasswordConfirmation}
          onChangeText={setNewPasswordConfirmation}
          errorText={newPasswordErrors.matchesConfirmation ? strings.repeatPasswordInputNotMatchError : undefined}
          returnKeyType="done"
          right={
            !newPasswordErrors.matchesConfirmation && !newPasswordErrors.passwordConfirmationReq ? (
              <Checkmark />
            ) : undefined
          }
          autoComplete={false}
        />
      </ScrollView>

      <Actions>
        <Button
          onPress={() => changePassword({currentPassword, newPassword})}
          disabled={hasErrors}
          title={strings.continueButton}
        />
      </Actions>
    </SafeAreaView>
  )
}

const CurrentPasswordInput = TextInput
const PasswordInput = TextInput
const PasswordConfirmationInput = TextInput
const Actions = (props) => <View {...props} style={styles.actions} />

const messages = defineMessages({
  oldPasswordInputLabel: {
    id: 'components.settings.changepasswordscreen.oldPasswordInputLabel',
    defaultMessage: '!!!Current password',
  },
  newPasswordInputLabel: {
    id: 'components.settings.changepasswordscreen.newPasswordInputLabel',
    defaultMessage: '!!!New password',
  },
  passwordStrengthRequirement: {
    id: 'components.walletinit.createwallet.createwalletscreen.passwordLengthRequirement',
    defaultMessage: '!!!Minimum {requirePasswordLength} characters',
  },
  repeatPasswordInputLabel: {
    id: 'components.settings.changepasswordscreen.repeatPasswordInputLabel',
    defaultMessage: '!!!Repeat new password',
  },
  repeatPasswordInputNotMatchError: {
    id: 'components.settings.changepasswordscreen.repeatPasswordInputNotMatchError',
    defaultMessage: '!!!Passwords do not match',
  },
  continueButton: {
    id: 'components.settings.changepasswordscreen.continueButton',
    defaultMessage: '!!!Change password',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    oldPasswordInputLabel: intl.formatMessage(messages.oldPasswordInputLabel),
    newPasswordInputLabel: intl.formatMessage(messages.newPasswordInputLabel),
    passwordStrengthRequirement: intl.formatMessage(messages.passwordStrengthRequirement, {
      requiredPasswordLength: REQUIRED_PASSWORD_LENGTH,
    }),
    repeatPasswordInputLabel: intl.formatMessage(messages.repeatPasswordInputLabel),
    repeatPasswordInputNotMatchError: intl.formatMessage(messages.repeatPasswordInputNotMatchError),
    continueButton: intl.formatMessage(messages.continueButton),
    incorrectPassword: intl.formatMessage(errorMessages.incorrectPassword.title),
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  actions: {
    padding: 16,
    backgroundColor: COLORS.BACKGROUND,
  },
})

const useChangePassword = (
  wallet: YoroiWallet,
  mutationOptions: MutationOptions<void, Error, {currentPassword: string; newPassword: string}>,
) => {
  const intl = useIntl()
  const {mutate, ...mutation} = useMutation(
    ({currentPassword, newPassword}) => wallet.changePassword(currentPassword, newPassword, intl),
    mutationOptions,
  )

  return {
    changePassword: mutate,
    ...mutation,
  }
}

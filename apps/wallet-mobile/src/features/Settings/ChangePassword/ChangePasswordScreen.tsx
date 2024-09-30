import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, TextInput as RNTextInput, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {MutationOptions, useMutation} from '@tanstack/react-query'

import {Button} from '../../../components/Button/Button'
import {KeyboardAvoidingView} from '../../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {Checkmark, TextInput} from '../../../components/TextInput/TextInput'
import {errorMessages} from '../../../kernel/i18n/global-messages'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {REQUIRED_PASSWORD_LENGTH, validatePassword} from '../../../yoroi-wallets/utils/validators'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'

export const ChangePasswordScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
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

  const {wallet} = useSelectedWallet()
  const {changePassword, isError, reset} = useChangePassword(wallet, {
    onSuccess: () => navigation.goBack(),
    onError: () => currentPasswordRef.current?.focus(),
  })

  return (
    <KeyboardAvoidingView style={styles.root}>
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
            autoComplete="off"
          />

          <PasswordInput
            ref={newPasswordRef}
            enablesReturnKeyAutomatically
            secureTextEntry
            label={strings.newPasswordInputLabel}
            value={newPassword}
            onChangeText={setNewPassword}
            errorText={newPasswordErrors.passwordIsWeak ? strings.passwordStrengthRequirement : undefined}
            helper={strings.passwordStrengthRequirement}
            returnKeyType="next"
            onSubmitEditing={() => newPasswordConfirmationRef.current?.focus()}
            right={!newPasswordErrors.passwordIsWeak ? <Checkmark /> : undefined}
            autoComplete="off"
          />

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
            autoComplete="off"
          />
        </ScrollView>

        <Actions>
          <Button
            onPress={() => changePassword({currentPassword, newPassword})}
            disabled={hasErrors}
            title={strings.continueButton}
            shelleyTheme
          />
        </Actions>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const CurrentPasswordInput = TextInput
const PasswordInput = TextInput
const PasswordConfirmationInput = TextInput
const Actions = (props: ViewProps) => {
  const styles = useStyles()
  return <View {...props} style={styles.actions} />
}

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

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
    },
    safeAreaView: {
      ...atoms.flex_1,
    },
    contentContainer: {
      ...atoms.p_lg,
      ...atoms.gap_lg,
    },
    actions: {
      backgroundColor: color.bg_color_max,
      ...atoms.p_lg,
    },
  })
  return styles
}

const useChangePassword = (
  wallet: YoroiWallet,
  mutationOptions: MutationOptions<void, Error, {currentPassword: string; newPassword: string}>,
) => {
  const {walletManager} = useWalletManager()
  const {mutate, ...mutation} = useMutation(
    ({currentPassword, newPassword}) =>
      walletManager.changeWalletPassword({
        id: wallet.id,
        oldPassword: currentPassword,
        newPassword,
      }),
    mutationOptions,
  )

  return {
    changePassword: mutate,
    ...mutation,
  }
}

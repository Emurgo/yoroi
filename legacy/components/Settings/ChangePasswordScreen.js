// @flow

import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {showErrorDialog} from '../../actions'
import {WrongPassword} from '../../crypto/errors'
import walletManager from '../../crypto/walletManager'
import {errorMessages} from '../../i18n/global-messages'
import {COLORS} from '../../styles/config'
import {REQUIRED_PASSWORD_LENGTH, validatePassword} from '../../utils/validators'
import {Button, Spacer, TextInput} from '../UiKit'
import {Checkmark} from '../UiKit/TextInput'

const ChangePasswordScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation()
  const onSubmit = async (oldPassword, newPassword) => {
    try {
      await walletManager.changePassword(oldPassword, newPassword, intl)
      navigation.goBack()
    } catch (error) {
      if (error instanceof WrongPassword) {
        await showErrorDialog(errorMessages.incorrectPassword, intl)
      } else {
        throw error
      }
    }
  }

  const [currentPassword, setCurrentPassword] = React.useState('')
  const currentPasswordErrors = currentPassword.length === 0 ? {currentPasswordRequired: true} : {}

  const newPasswordRef = React.useRef<{focus: () => void} | null>(null)
  const [newPassword, setNewPassword] = React.useState('')

  const newPasswordConfirmationRef = React.useRef<{focus: () => void} | null>(null)
  const [newPasswordConfirmation, setNewPasswordConfirmation] = React.useState('')
  const newPasswordErrors = validatePassword(newPassword, newPasswordConfirmation)

  const hasErrors = Object.keys(currentPasswordErrors).length > 0 || Object.keys(newPasswordErrors).length > 0

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ScrollView bounces={false} keyboardDismissMode="on-drag" contentContainerStyle={styles.contentContainer}>
        <CurrentPasswordInput
          enablesReturnKeyAutomatically
          autoFocus
          secureTextEntry
          label={strings.oldPasswordInputLabel}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          returnKeyType={'next'}
          onSubmitEditing={() => newPasswordRef.current?.focus()}
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
          returnKeyType={'next'}
          onSubmitEditing={() => newPasswordConfirmationRef.current?.focus()}
          right={!newPasswordErrors.passwordIsWeak ? <Checkmark /> : undefined}
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
          returnKeyType={'done'}
          right={
            !newPasswordErrors.matchesConfirmation && !newPasswordErrors.passwordConfirmationReq ? (
              <Checkmark />
            ) : undefined
          }
        />
      </ScrollView>

      <Actions>
        <Button
          onPress={() => onSubmit(currentPassword, newPassword)}
          disabled={hasErrors}
          title={strings.continueButton}
        />
      </Actions>
    </SafeAreaView>
  )
}

export default ChangePasswordScreen

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

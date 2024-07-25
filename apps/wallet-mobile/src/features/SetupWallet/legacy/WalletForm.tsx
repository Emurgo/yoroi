import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, TextInput as RNTextInput, View, ViewProps} from 'react-native'

import {Button, Checkmark, KeyboardAvoidingView, Spacer, TextInput} from '../../../components'
import {debugWalletInfo, features} from '../../../kernel/features'
import globalMessages from '../../../kernel/i18n/global-messages'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {isEmptyString} from '../../../kernel/utils'
import {
  getWalletNameError,
  REQUIRED_PASSWORD_LENGTH,
  validatePassword,
  validateWalletName,
} from '../../../yoroi-wallets/utils/validators'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'

type Props = {
  onSubmit: (credentials: {name: string; password: string}) => void
}

export const WalletForm = ({onSubmit}: Props) => {
  const styles = useStyles()
  const strings = useStrings()
  const {walletManager} = useWalletManager()
  const walletNames = Array.from(walletManager.walletMetas.values()).map(({name}) => name)
  const {track} = useMetrics()
  const [name, setName] = React.useState(features.prefillWalletInfo ? debugWalletInfo.WALLET_NAME : '')
  const nameErrors = validateWalletName(name, null, walletNames)
  const walletNameErrorText = getWalletNameError(
    {tooLong: strings.tooLong, nameAlreadyTaken: strings.nameAlreadyTaken, mustBeFilled: strings.mustBeFilled},
    nameErrors,
  )

  const passwordRef = React.useRef<RNTextInput>(null)
  const [password, setPassword] = React.useState(features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '')

  const passwordConfirmationRef = React.useRef<RNTextInput>(null)
  const [passwordConfirmation, setPasswordConfirmation] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )
  const passwordErrors = validatePassword(password, passwordConfirmation)
  const passwordErrorText = passwordErrors.passwordIsWeak
    ? strings.passwordStrengthRequirement({requiredPasswordLength: REQUIRED_PASSWORD_LENGTH})
    : undefined
  const passwordConfirmationErrorText = passwordErrors.matchesConfirmation
    ? strings.repeatPasswordInputError
    : undefined

  useFocusEffect(
    React.useCallback(() => {
      track.restoreWalletDetailsStepViewed()
    }, [track]),
  )

  return (
    <View style={styles.safeAreaView}>
      <KeyboardAvoidingView style={{flex: 1}}>
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
            onChangeText={(walletName: string) => setName(walletName)}
            errorText={!isEmptyString(walletNameErrorText) ? walletNameErrorText : undefined}
            errorDelay={0}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            testID="walletNameInput"
            autoComplete="off"
            showErrorOnBlur
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
            helper={strings.passwordStrengthRequirement({
              requiredPasswordLength: REQUIRED_PASSWORD_LENGTH,
            })}
            right={!passwordErrors.passwordIsWeak ? <Checkmark /> : undefined}
            onSubmitEditing={() => passwordConfirmationRef.current?.focus()}
            testID="walletPasswordInput"
            autoComplete="off"
            showErrorOnBlur
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
            autoComplete="off"
            showErrorOnBlur
          />
        </ScrollView>

        <Actions>
          <Button
            onPress={() => onSubmit({name: name.trim(), password})}
            disabled={Object.keys(passwordErrors).length > 0 || Object.keys(nameErrors).length > 0}
            title={strings.continueButton}
            testID="walletFormContinueButton"
          />
        </Actions>
      </KeyboardAvoidingView>
    </View>
  )
}

const WalletNameInput = TextInput
const PasswordInput = TextInput
const PasswordConfirmationInput = TextInput
const Actions = (props: ViewProps) => {
  const styles = useStyles()
  return <View {...props} style={styles.actions} />
}

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
    passwordStrengthRequirement: (options: {requiredPasswordLength: number}) =>
      intl.formatMessage(messages.passwordStrengthRequirement, options),
    repeatPasswordInputLabel: intl.formatMessage(messages.repeatPasswordInputLabel),
    repeatPasswordInputError: intl.formatMessage(messages.repeatPasswordInputError),
    tooLong: intl.formatMessage(globalMessages.walletNameErrorTooLong),
    nameAlreadyTaken: intl.formatMessage(globalMessages.walletNameErrorNameAlreadyTaken),
    mustBeFilled: intl.formatMessage(globalMessages.walletNameErrorMustBeFilled),
  }
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
    },
    scrollContentContainer: {
      paddingHorizontal: 16,
      paddingTop: 40,
    },
    actions: {
      ...atoms.p_lg,
      backgroundColor: color.bg_color_high,
    },
  })
  return styles
}

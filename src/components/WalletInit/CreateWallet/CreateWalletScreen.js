// @flow

import React from 'react'
import {TextInput, View} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {NavigationEvents} from 'react-navigation'
import {withHandlers, withState} from 'recompose'

import CheckIcon from '../../../assets/CheckIcon'
import {Text, Button} from '../../UiKit'
import Screen from '../../Screen'
import {validatePassword} from '../../../utils/validators'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'

import styles from './styles/CreateWalletScreen.style'
import {COLORS} from '../../../styles/config'

import type {PasswordValidationErrors} from '../../../utils/validators'
import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

type FormValidationErrors = PasswordValidationErrors & {nameReq?: boolean}

const getTranslations = (state: State) => state.trans.createWallet

const handleCreate = ({navigation, password}) => () => {
  navigation.navigate(WALLET_INIT_ROUTES.RECOVERY_PHRASE_DIALOG, {password})
}

const validateForm = ({
  name,
  password,
  passwordConfirmation,
}): FormValidationErrors | null => {
  const nameErrors = name !== '' ? null : {nameReq: true}
  const passwordErrors = validatePassword(password, passwordConfirmation)

  return nameErrors || passwordErrors
    ? {...nameErrors, ...passwordErrors}
    : null
}

const handleOnWillBlur = ({setPassword, setPasswordConfirmation}) => () => {
  setPassword('')
  setPasswordConfirmation('')
}

type Props = {
  handleCreate: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
  name: string,
  password: string,
  passwordConfirmation: string,
  setName: (string) => mixed,
  setPassword: (string) => mixed,
  setPasswordConfirmation: (string) => mixed,
  onWillBlur: () => void,
  validateForm: () => FormValidationErrors | null,
}

const CreateWalletScreen = ({
  handleCreate,
  translations,
  name,
  password,
  passwordConfirmation,
  setName,
  setPassword,
  setPasswordConfirmation,
  validateForm,
  onWillBlur,
}: Props) => {
  const errors = validateForm()

  return (
    <Screen bgColor={COLORS.TRANSPARENT} scroll>
      <NavigationEvents onWillBlur={onWillBlur} />
      <View style={styles.container}>
        <View>
          <Text style={styles.formLabel}>{translations.nameLabel}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              onChangeText={setName}
              value={name}
              autoFocus
            />
            <CheckIcon
              width={25}
              height={25}
              color={
                errors && errors.nameReq
                  ? COLORS.TRANSPARENT
                  : COLORS.LIGHT_POSITIVE_GREEN
              }
            />
          </View>
        </View>
        <View>
          <Text style={styles.formLabel}>{translations.passwordLabel}</Text>
          <TextInput
            secureTextEntry
            style={styles.input}
            onChangeText={setPassword}
            value={password}
          />
        </View>
        <View>
          <Text style={styles.formLabel}>
            {translations.passwordConfirmationLabel}
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              secureTextEntry
              style={styles.input}
              onChangeText={setPasswordConfirmation}
              value={passwordConfirmation}
            />
            <CheckIcon
              width={25}
              height={25}
              color={
                errors &&
                (errors.passwordConfirmationReq || errors.matchesConfirmation)
                  ? COLORS.TRANSPARENT
                  : COLORS.LIGHT_POSITIVE_GREEN
              }
            />
          </View>
        </View>
        <View>
          <Text>{translations.passwordRequirementsNote}</Text>
          <View style={styles.passwordRequirementsRow}>
            <View style={styles.passwordRequirement}>
              <CheckIcon width={16} height={16} />
              <Text style={styles.passwordRequirement}>
                {translations.passwordMinLength}
              </Text>
            </View>
            <View style={styles.passwordRequirement}>
              <CheckIcon width={16} height={16} />
              <Text style={styles.passwordRequirement}>
                {translations.passwordLowerChar}
              </Text>
            </View>
          </View>
          <View style={styles.passwordRequirementsRow}>
            <View style={styles.passwordRequirement}>
              <CheckIcon width={16} height={16} />
              <Text style={styles.passwordRequirement}>
                {translations.passwordUpperChar}
              </Text>
            </View>
            <View style={styles.passwordRequirement}>
              <CheckIcon width={16} height={16} />
              <Text style={styles.passwordRequirement}>
                {translations.passwordNumber}
              </Text>
            </View>
          </View>
        </View>

        <Button
          onPress={handleCreate}
          disabled={!!errors}
          title={translations.createButton}
        />
      </View>
    </Screen>
  )
}

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withState('name', 'setName', ''),
  withState('password', 'setPassword', ''),
  withState('passwordConfirmation', 'setPasswordConfirmation', ''),
  withHandlers({
    handleCreate,
    validateForm: ({name, password, passwordConfirmation}) => () =>
      validateForm({name, password, passwordConfirmation}),
    onWillBlur: handleOnWillBlur,
  }),
)(CreateWalletScreen)

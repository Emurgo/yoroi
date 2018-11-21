// @flow
import React from 'react'
import {View, TextInput} from 'react-native'
import {compose} from 'redux'
import {withState, withHandlers} from 'recompose'
import {NavigationEvents} from 'react-navigation'

import {Button, Text} from '../UiKit'
import CheckIcon from '../../assets/CheckIcon'
import {COLORS} from '../../styles/config'
import {validatePassword} from '../../utils/validators'
import {CONFIG} from '../../config'
import {withTranslations} from '../../utils/renderUtils'

import styles from './styles/WalletForm.style'

import type {ComponentType} from 'react'

import type {State} from '../../state'
import type {PasswordValidationErrors} from '../../utils/validators'

type FormValidationErrors = PasswordValidationErrors & {nameReq?: boolean}

const getTranslations = (state: State) => state.trans.WalletForm

const _validateForm = ({
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

type ValidationCheckIconProps = {
  isSatisfied: boolean,
  label: string,
}

const ValidationCheckIcon = ({
  isSatisfied,
  label,
}: ValidationCheckIconProps) => {
  const iconColor = isSatisfied ? COLORS.LIGHT_POSITIVE_GREEN : COLORS.BLACK
  return (
    <View style={styles.passwordRequirement}>
      <CheckIcon width={16} height={16} color={iconColor} />
      <Text style={styles.passwordRequirement}>{label}</Text>
    </View>
  )
}

const WalletForm = ({
  translations,
  name,
  password,
  passwordConfirmation,
  setName,
  setPassword,
  setPasswordConfirmation,
  handleSubmit,
  validateForm,
  handleOnWillBlur,
}) => {
  const errors = validateForm()

  return (
    <View>
      <NavigationEvents onWillBlur={handleOnWillBlur} />
      <View>
        <Text style={styles.formLabel}>{translations.nameLabel}</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            onChangeText={setName}
            value={name}
            autoFocus
          />
          {(!errors || !errors.nameReq) && (
            <CheckIcon
              width={25}
              height={25}
              color={COLORS.LIGHT_POSITIVE_GREEN}
            />
          )}
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
          {/* prettier-ignore */ (!errors ||
          (!errors.passwordConfirmationReq && !errors.matchesConfirmation)) && (
            <CheckIcon
              width={25}
              height={25}
              color={COLORS.LIGHT_POSITIVE_GREEN}
            />
          )}
        </View>
      </View>
      <View>
        <Text>{translations.passwordRequirementsNote}</Text>
        <View style={styles.passwordRequirementsRow}>
          <ValidationCheckIcon
            isSatisfied={!errors}
            label={translations.passwordMinLength}
          />
          <ValidationCheckIcon
            isSatisfied={!errors}
            label={translations.passwordLowerChar}
          />
        </View>
        <View style={styles.passwordRequirementsRow}>
          <ValidationCheckIcon
            isSatisfied={!errors}
            label={translations.passwordUpperChar}
          />
          <ValidationCheckIcon
            isSatisfied={!errors}
            label={translations.passwordNumber}
          />
        </View>
      </View>

      <Button
        onPress={handleSubmit}
        disabled={!!errors}
        title={translations.continueButton}
      />
    </View>
  )
}

type ExternalProps = {
  onSubmit: ({name: string, password: string}) => mixed,
}

export default (compose(
  withTranslations(getTranslations),
  withState(
    'name',
    'setName',
    CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.WALLET_NAME : '',
  ),
  withState(
    'password',
    'setPassword',
    CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '',
  ),
  withState(
    'passwordConfirmation',
    'setPasswordConfirmation',
    CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '',
  ),
  withHandlers({
    handleOnWillBlur,
    handleSubmit: ({onSubmit, name, password}) => () =>
      onSubmit({name, password}),
    validateForm: ({name, password, passwordConfirmation}) => () =>
      _validateForm({name, password, passwordConfirmation}),
  }),
)(WalletForm): ComponentType<ExternalProps>)

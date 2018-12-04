// @flow
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'
import {NavigationEvents, SafeAreaView} from 'react-navigation'
import _ from 'lodash'
import {withHandlers} from 'recompose'

import {Button, ValidatedTextInput} from '../UiKit'
import {
  validatePassword,
  getWalletNameError,
  validateWalletName,
} from '../../utils/validators'
import {CONFIG} from '../../config'
import PasswordStrengthIndicator from './PasswordStrengthIndicator'
import styles from './styles/WalletForm.style'
import {walletNamesSelector} from '../../selectors'

import type {State} from '../../state'
import type {
  PasswordValidationErrors,
  WalletNameValidationErrors,
} from '../../utils/validators'
import type {SubTranslation} from '../../l10n/typeHelpers'

type FormValidationErrors = PasswordValidationErrors &
  WalletNameValidationErrors

const getTranslations = (state: State) => state.trans.WalletNameAndPasswordForm
const getErrorTranslations = (state) => state.trans.WalletNameAndPasswordForm

type ComponentState = {
  name: string,
  password: string,
  passwordConfirmation: string,
  showPasswordsDoNotMatchError: boolean,
}

type Props = {
  translations: SubTranslation<typeof getTranslations>,
  errorTranslations: SubTranslation<typeof getErrorTranslations>,
  walletNames: Array<string>,
  onSubmit: ({name: string, password: string}) => mixed,
  // $FlowFixMe
  validateWalletName: (walletName: string) => WalletNameValidationErrors,
}

class WalletForm extends PureComponent<Props, ComponentState> {
  /* prettier-ignore */
  state = CONFIG.DEBUG.PREFILL_FORMS
    ? {
      name: CONFIG.DEBUG.WALLET_NAME,
      password: CONFIG.DEBUG.PASSWORD,
      passwordConfirmation: CONFIG.DEBUG.PASSWORD,
      showPasswordsDoNotMatchError: false,
    }
    : {
      name: '',
      password: '',
      passwordConfirmation: '',
      showPasswordsDoNotMatchError: false,
    }

  debouncedHandlePasswordMatchValidation = _.debounce(() => {
    this.setState(({password, passwordConfirmation}) => ({
      showPasswordsDoNotMatchError:
        !!passwordConfirmation && password !== passwordConfirmation,
    }))
  }, 300)

  handleOnWillBlur = () =>
    this.setState({password: '', passwordConfirmation: ''})

  handleSubmit = () => {
    const {name, password} = this.state

    this.props.onSubmit({name, password})
  }

  handleSetName = (name) => this.setState({name})

  handleSetPassword = (password) => {
    this.debouncedHandlePasswordMatchValidation()
    this.setState({password})
  }

  handleSetPasswordConfirmation = (passwordConfirmation) => {
    this.debouncedHandlePasswordMatchValidation()
    this.setState({passwordConfirmation})
  }

  validateForm = (): FormValidationErrors => {
    const {name, password, passwordConfirmation} = this.state

    const nameErrors = this.props.validateWalletName(name)
    const passwordErrors = validatePassword(password, passwordConfirmation)

    return {...nameErrors, ...passwordErrors}
  }

  render() {
    const {translations} = this.props
    const {
      name,
      password,
      passwordConfirmation,
      showPasswordsDoNotMatchError,
    } = this.state

    const validationErrors = this.validateForm()

    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.container}>
          <NavigationEvents onWillBlur={this.handleOnWillBlur} />
          <View style={styles.content}>
            <ValidatedTextInput
              label={translations.walletNameInput.label}
              value={name}
              onChangeText={this.handleSetName}
              error={getWalletNameError(
                translations.walletNameInput.errors,
                validationErrors,
              )}
            />

            <ValidatedTextInput
              secureTextEntry
              label={translations.newPasswordInput.label}
              value={password}
              onChangeText={this.handleSetPassword}
            />

            <ValidatedTextInput
              secureTextEntry
              label={translations.repeatPasswordInput.label}
              value={passwordConfirmation}
              onChangeText={this.handleSetPasswordConfirmation}
              error={
                showPasswordsDoNotMatchError &&
                translations.repeatPasswordInput.errors.passwordsDoNotMatch
              }
            />

            <PasswordStrengthIndicator password={password} />
          </View>

          <View style={styles.action}>
            <Button
              onPress={this.handleSubmit}
              disabled={!_.isEmpty(validationErrors)}
              title={translations.continueButton}
            />
          </View>
        </View>
      </SafeAreaView>
    )
  }
}

export default compose(
  connect(
    (state) => ({
      translations: getTranslations(state),
      errorTranslations: getErrorTranslations(state),
      walletNames: walletNamesSelector(state),
    }),
    {validateWalletName},
  ),
  withHandlers({
    validateWalletName: ({walletNames}) => (walletName) =>
      validateWalletName(walletName, null, walletNames),
  }),
)(WalletForm)

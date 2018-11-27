// @flow
import React, {PureComponent} from 'react'
import {View} from 'react-native'
import {NavigationEvents, SafeAreaView} from 'react-navigation'
import _ from 'lodash'

import {Button, ValidatedTextInput} from '../UiKit'
import {validatePassword} from '../../utils/validators'
import {CONFIG} from '../../config'
import {withTranslations} from '../../utils/renderUtils'
import PasswordStrengthIndicator from './PasswordStrengthIndicator'
import styles from './styles/WalletForm.style'

import type {State} from '../../state'
import type {PasswordValidationErrors} from '../../utils/validators'
import type {SubTranslation} from '../../l10n/typeHelpers'

type FormValidationErrors = PasswordValidationErrors & {nameReq?: boolean}

const getTranslations = (state: State) => state.trans.WalletNameAndPasswordForm

const validateForm = ({
  name,
  password,
  passwordConfirmation,
}): FormValidationErrors => {
  const nameErrors = name !== '' ? {} : {nameReq: true}
  const passwordErrors = validatePassword(password, passwordConfirmation)

  return {...nameErrors, ...passwordErrors}
}

type ComponentState = {
  name: string,
  password: string,
  passwordConfirmation: string,
  showPasswordsDoNotMatchError: boolean,
}

type Props = {|
  translations: SubTranslation<typeof getTranslations>,
  onSubmit: ({name: string, password: string}) => mixed,
|}

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

  render() {
    const {translations} = this.props
    const {
      name,
      password,
      passwordConfirmation,
      showPasswordsDoNotMatchError,
    } = this.state

    const errors = validateForm({name, password, passwordConfirmation})

    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.container}>
          <NavigationEvents onWillBlur={this.handleOnWillBlur} />
          <View style={styles.content}>
            <ValidatedTextInput
              label={translations.nameLabel}
              value={name}
              onChange={this.handleSetName}
            />

            <ValidatedTextInput
              secureTextEntry
              label={translations.passwordLabel}
              value={password}
              onChange={this.handleSetPassword}
            />

            <ValidatedTextInput
              secureTextEntry
              label={translations.passwordConfirmationLabel}
              value={passwordConfirmation}
              onChange={this.handleSetPasswordConfirmation}
              error={
                showPasswordsDoNotMatchError && translations.passwordsDoNotMatch
              }
            />

            <PasswordStrengthIndicator password={password} />
          </View>

          <View style={styles.action}>
            <Button
              onPress={this.handleSubmit}
              disabled={!_.isEmpty(errors)}
              title={translations.continueButton}
            />
          </View>
        </View>
      </SafeAreaView>
    )
  }
}

export default withTranslations(getTranslations)(WalletForm)

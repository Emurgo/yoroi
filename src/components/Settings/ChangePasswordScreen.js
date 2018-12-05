// @flow

import React, {PureComponent} from 'react'
import {compose} from 'redux'
import {View} from 'react-native'
import {NavigationEvents} from 'react-navigation'
import _ from 'lodash'
import {withHandlers} from 'recompose'

import {Button, ValidatedTextInput, StatusBar} from '../UiKit'
import Screen from '../Screen'
import {validatePassword} from '../../utils/validators'
import {withTranslations, withNavigationTitle} from '../../utils/renderUtils'
import PasswordStrengthIndicator from '../WalletInit/PasswordStrengthIndicator'
import {showErrorDialog} from '../../actions'
import walletManager from '../../crypto/wallet'
import {WrongPassword} from '../../crypto/errors'

import styles from './styles/ChangePasswordScreen.style'

import type {State} from '../../state'
import type {PasswordValidationErrors} from '../../utils/validators'
import type {SubTranslation} from '../../l10n/typeHelpers'
import type {Navigation} from '../../types/navigation'

type FormValidationErrors = PasswordValidationErrors & {
  oldPasswordRequired?: boolean,
}

const getTranslations = (state: State) => state.trans.ChangePasswordScreen

const validateForm = ({
  oldPassword,
  password,
  passwordConfirmation,
}): FormValidationErrors => {
  const passwordErrors = validatePassword(password, passwordConfirmation)

  const oldPasswordErrors =
    oldPassword.length === 0 ? {oldPasswordRequired: true} : {}

  return {...oldPasswordErrors, ...passwordErrors}
}

type ComponentState = {
  oldPassword: string,
  password: string,
  passwordConfirmation: string,
  showPasswordsDoNotMatchError: boolean,
}

type Props = {
  translations: SubTranslation<typeof getTranslations>,
  onSubmit: (string, string) => any,
  navigation: Navigation,
}

class ChangePasswordScreen extends PureComponent<Props, ComponentState> {
  state = {
    oldPassword: '',
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

  handleSetOldPassword = (oldPassword) => this.setState({oldPassword})

  handleSetPassword = (password) => {
    this.debouncedHandlePasswordMatchValidation()
    this.setState({password})
  }

  handleSetPasswordConfirmation = (passwordConfirmation) => {
    this.debouncedHandlePasswordMatchValidation()
    this.setState({passwordConfirmation})
  }

  handleOnWillBlur = () =>
    this.setState({password: '', passwordConfirmation: ''})

  handleSubmit = () => {
    const {oldPassword, password} = this.state

    this.props.onSubmit(oldPassword, password)
  }

  render() {
    const {translations} = this.props
    const {
      oldPassword,
      password,
      passwordConfirmation,
      showPasswordsDoNotMatchError,
    } = this.state

    const errors = validateForm({
      oldPassword,
      password,
      passwordConfirmation,
    })

    return (
      <Screen scroll style={styles.container}>
        <StatusBar type="dark" />

        <NavigationEvents onWillBlur={this.handleOnWillBlur} />

        <View style={styles.content}>
          <ValidatedTextInput
            secureTextEntry
            label={translations.oldPasswordInput.label}
            value={oldPassword}
            onChangeText={this.handleSetOldPassword}
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
            disabled={!_.isEmpty(errors)}
            title={translations.continueButton}
          />
        </View>
      </Screen>
    )
  }
}

export default compose(
  withTranslations(getTranslations),
  withNavigationTitle(({translations}) => translations.title),
  withHandlers({
    onSubmit: ({navigation}) => async (oldPassword, newPassword) => {
      try {
        await walletManager.changePassword(oldPassword, newPassword)
        navigation.goBack(null)
      } catch (e) {
        if (e instanceof WrongPassword) {
          await showErrorDialog((dialogs) => dialogs.incorrectPassword)
        } else {
          throw e
        }
      }
    },
  }),
)(ChangePasswordScreen)

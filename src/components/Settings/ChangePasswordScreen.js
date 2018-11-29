// @flow

import React, {PureComponent} from 'react'
import {compose} from 'redux'
import {View} from 'react-native'
import {SafeAreaView, NavigationEvents} from 'react-navigation'

import _ from 'lodash'
import {withHandlers} from 'recompose'

import {Button, ValidatedTextInput} from '../UiKit'
import {validatePassword} from '../../utils/validators'
import {withTranslations, withNavigationTitle} from '../../utils/renderUtils'
import PasswordStrengthIndicator from '../WalletInit/PasswordStrengthIndicator'
import {showErrorDialog} from '../../actions'

import styles from './styles/ChangePasswordScreen.style'

import type {State} from '../../state'
import type {PasswordValidationErrors} from '../../utils/validators'
import type {SubTranslation} from '../../l10n/typeHelpers'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'

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
  handleSubmit: () => mixed,
  navigation: NavigationScreenProp<NavigationState>,
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

  render() {
    const {translations, handleSubmit} = this.props
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
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.container}>
          <NavigationEvents onWillBlur={this.handleOnWillBlur} />

          <View style={styles.content}>
            <ValidatedTextInput
              secureTextEntry
              label={translations.oldPassword}
              value={oldPassword}
              onChangeText={this.handleSetOldPassword}
            />

            <ValidatedTextInput
              secureTextEntry
              label={translations.newPassword}
              value={password}
              onChangeText={this.handleSetPassword}
            />

            <ValidatedTextInput
              secureTextEntry
              label={translations.repeatPassword}
              value={passwordConfirmation}
              onChangeText={this.handleSetPasswordConfirmation}
              error={
                showPasswordsDoNotMatchError && translations.passwordsDoNotMatch
              }
            />

            <PasswordStrengthIndicator password={password} />
          </View>

          <View style={styles.action}>
            <Button
              onPress={handleSubmit}
              disabled={!_.isEmpty(errors)}
              title={translations.continue}
            />
          </View>
        </View>
      </SafeAreaView>
    )
  }
}

export default compose(
  withTranslations(getTranslations),
  withNavigationTitle(({translations}) => translations.title),
  withHandlers({
    handleSubmit: ({navigation}) => () => {
      const todoValidatePassword = true

      if (todoValidatePassword) {
        showErrorDialog((dialogs) => dialogs.incorrectPassword)
      } else {
        navigation.goBack(null)
      }
    },
  }),
)(ChangePasswordScreen)

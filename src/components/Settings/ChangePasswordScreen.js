// @flow

import React, {PureComponent} from 'react'
import {compose} from 'redux'
import {View, ScrollView} from 'react-native'
import {SafeAreaView, NavigationEvents} from 'react-navigation'
import _ from 'lodash'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {Button, ValidatedTextInput, StatusBar} from '../UiKit'
import {validatePassword} from '../../utils/validators'
import {withNavigationTitle} from '../../utils/renderUtils'
import PasswordStrengthIndicator from '../WalletInit/PasswordStrengthIndicator'
import {showErrorDialog} from '../../actions'
import walletManager from '../../crypto/wallet'
import {WrongPassword} from '../../crypto/errors'

import styles from './styles/ChangePasswordScreen.style'

import type {State} from '../../state'
import type {PasswordValidationErrors} from '../../utils/validators'
import type {Navigation} from '../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.settings.changepasswordscreen.title',
    defaultMessage: 'Change wallet password',
    description: "some desc",
  },
  oldPasswordInputLabel: {
    id: 'components.settings.changepasswordscreen.oldPasswordInputLabel',
    defaultMessage: 'Current password',
    description: "some desc",
  },
  newPasswordInputLabel: {
    id: 'components.settings.changepasswordscreen.newPasswordInputLabel',
    defaultMessage: 'New password',
    description: "some desc",
  },
  repeatPasswordInputLabel: {
    id: 'components.settings.changepasswordscreen.repeatPasswordInputLabel',
    defaultMessage: 'Repeat new password',
    description: "some desc",
  },
  repeatPasswordInputNotMatchError: {
    id: 'components.settings.changepasswordscreen.repeatPasswordInputNotMatchError',
    defaultMessage: 'Passwords do not match',
    description: "some desc",
  },
  continueButton: {
    id: 'components.settings.changepasswordscreen.continueButton',
    defaultMessage: 'Change password',
    description: "some desc",
  },
})

type FormValidationErrors = PasswordValidationErrors & {
  oldPasswordRequired?: boolean,
}

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
    const {intl} = this.props
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
        <StatusBar type="dark" />

        <View style={styles.container}>
          <NavigationEvents onWillBlur={this.handleOnWillBlur} />

          <ScrollView
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.content}
          >
            <ValidatedTextInput
              secureTextEntry
              label={intl.formatMessage(messages.oldPasswordInputLabel)}
              value={oldPassword}
              onChangeText={this.handleSetOldPassword}
            />

            <ValidatedTextInput
              secureTextEntry
              label={intl.formatMessage(messages.newPasswordInputLabel)}
              value={password}
              onChangeText={this.handleSetPassword}
            />

            <ValidatedTextInput
              secureTextEntry
              label={intl.formatMessage(messages.repeatPasswordInputLabel)}
              value={passwordConfirmation}
              onChangeText={this.handleSetPasswordConfirmation}
              error={
                showPasswordsDoNotMatchError &&
                intl.formatMessage(messages.repeatPasswordInputNotMatchError)
              }
            />

            <PasswordStrengthIndicator password={password} />
          </ScrollView>

          <View style={styles.action}>
            <Button
              onPress={this.handleSubmit}
              disabled={!_.isEmpty(errors)}
              title={intl.formatMessage(messages.continueButton)}
            />
          </View>
        </View>
      </SafeAreaView>
    )
  }
}

export default injectIntl(compose(
  withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
  withHandlers({
    onSubmit: ({navigation, intl}) => async (oldPassword, newPassword) => {
      try {
        await walletManager.changePassword(oldPassword, newPassword, intl)
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
)(ChangePasswordScreen))

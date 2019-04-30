// @flow
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, ScrollView} from 'react-native'
import {NavigationEvents, SafeAreaView} from 'react-navigation'
import _ from 'lodash'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {Button, ValidatedTextInput, StatusBar} from '../UiKit'
import {
  validatePassword,
  getWalletNameError,
  validateWalletName,
} from '../../utils/validators'
import {CONFIG} from '../../config'
import PasswordStrengthIndicator from './PasswordStrengthIndicator'
import styles from './styles/WalletForm.style'
import {walletNamesSelector} from '../../selectors'
import globalMessages from '../../i18n/global-messages'

import type {
  PasswordValidationErrors,
  WalletNameValidationErrors,
} from '../../utils/validators'

const messages = defineMessages({
  walletNameInputLabel: {
    id: 'components.walletinit.walletform.walletNameInputLabel',
    defaultMessage: '!!!Wallet name',
    description: 'some desc',
  },
  newPasswordInput: {
    id: 'components.walletinit.walletform.newPasswordInput',
    defaultMessage: '!!!Wallet password',
    description: 'some desc',
  },
  continueButton: {
    id: 'components.walletinit.walletform.continueButton',
    defaultMessage: '!!!Continue',
    description: 'some desc',
  },
  repeatPasswordInputLabel: {
    id: 'components.walletinit.walletform.repeatPasswordInputLabel',
    defaultMessage: '!!!Repeat password',
    description: 'some desc',
  },
  repeatPasswordInputError: {
    id: 'components.walletinit.walletform.repeatPasswordInputError',
    defaultMessage: '!!!Passwords do not match',
    description: 'some desc',
  },
})

type FormValidationErrors = PasswordValidationErrors &
  WalletNameValidationErrors

type ComponentState = {
  name: string,
  password: string,
  passwordConfirmation: string,
  showPasswordsDoNotMatchError: boolean,
}

type Props = {
  intl: any,
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
    const {intl} = this.props
    const {
      name,
      password,
      passwordConfirmation,
      showPasswordsDoNotMatchError,
    } = this.state

    const validationErrors = this.validateForm()

    return (
      <SafeAreaView style={styles.safeAreaView}>
        <StatusBar type="dark" />
        <NavigationEvents onWillBlur={this.handleOnWillBlur} />

        <ScrollView keyboardDismissMode="on-drag">
          <View style={styles.content}>
            <ValidatedTextInput
              label={intl.formatMessage(messages.walletNameInputLabel)}
              value={name}
              onChangeText={this.handleSetName}
              error={getWalletNameError(
                {
                  tooLong: intl.formatMessage(
                    globalMessages.walletNameErrorTooLong,
                  ),
                  nameAlreadyTaken: intl.formatMessage(
                    globalMessages.walletNameErrorNameAlreadyTaken,
                  ),
                },
                validationErrors,
              )}
            />

            <ValidatedTextInput
              secureTextEntry
              label={intl.formatMessage(messages.newPasswordInput)}
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
                intl.formatMessage(messages.repeatPasswordInputError)
              }
            />

            <PasswordStrengthIndicator password={password} />
          </View>
        </ScrollView>

        <View style={styles.action}>
          <Button
            onPress={this.handleSubmit}
            disabled={!_.isEmpty(validationErrors)}
            title={intl.formatMessage(messages.continueButton)}
          />
        </View>
      </SafeAreaView>
    )
  }
}

export default injectIntl(
  compose(
    connect(
      (state) => ({
        walletNames: walletNamesSelector(state),
      }),
      {validateWalletName},
    ),
    withHandlers({
      validateWalletName: ({walletNames}) => (walletName) =>
        validateWalletName(walletName, null, walletNames),
    }),
  )(WalletForm),
)

// @flow
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import _ from 'lodash'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {Button, ValidatedTextInput, StatusBar} from '../UiKit'
import {
  validatePassword,
  getWalletNameError,
  validateWalletName,
} from '../../utils/validators'
import {CONFIG} from '../../config/config'
import PasswordStrengthIndicator from './PasswordStrengthIndicator'
import styles from './styles/WalletForm.style'
import {walletNamesSelector} from '../../selectors'
import globalMessages from '../../i18n/global-messages'

import type {
  PasswordValidationErrors,
  WalletNameValidationErrors,
} from '../../utils/validators'
import type {Navigation} from '../../types/navigation'

const messages = defineMessages({
  walletNameInputLabel: {
    id: 'components.walletinit.walletform.walletNameInputLabel',
    defaultMessage: '!!!Wallet name',
    description: 'some desc',
  },
  newPasswordInput: {
    id: 'components.walletinit.walletform.newPasswordInput',
    defaultMessage: '!!!Spending password',
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

type FormValidationErrors = {
  nameErrors: WalletNameValidationErrors,
  passwordErrors: PasswordValidationErrors,
}

type ComponentState = {
  name: string,
  password: string,
  passwordConfirmation: string,
  showPasswordsDoNotMatchError: boolean,
}

type Props = {
  intl: any,
  walletNames: Array<string>,
  onSubmit: ({
    name: string,
    password: string,
  }) => mixed,
  validateWalletName: (walletName: string) => WalletNameValidationErrors,
  navigation: Navigation,
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

  _unsubscribe: void | (() => mixed) = undefined

  debouncedHandlePasswordMatchValidation = _.debounce(() => {
    this.setState(({password, passwordConfirmation}) => ({
      showPasswordsDoNotMatchError:
        !!passwordConfirmation && password !== passwordConfirmation,
    }))
  }, 300)

  componentDidMount = () => {
    this._unsubscribe = this.props.navigation.addListener('blur', () =>
      this.handleOnWillBlur(),
    )
  }

  componentWillUnmount = () => {
    if (this._unsubscribe != null) this._unsubscribe()
  }

  handleOnWillBlur = () =>
    this.setState({
      password: '',
      passwordConfirmation: '',
    })

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

    return {
      nameErrors,
      passwordErrors,
    }
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
                validationErrors.nameErrors,
              )}
              testID="walletNameInput"
            />

            <ValidatedTextInput
              secureTextEntry
              label={intl.formatMessage(messages.newPasswordInput)}
              value={password}
              onChangeText={this.handleSetPassword}
              testID="walletPasswordInput"
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
              testID="walletRepeatPasswordInput"
            />

            <PasswordStrengthIndicator password={password} />
          </View>
        </ScrollView>

        <View style={styles.action}>
          <Button
            onPress={this.handleSubmit}
            disabled={
              !_.isEmpty({
                ...validationErrors.nameErrors,
                ...validationErrors.passwordErrors,
              })
            }
            title={intl.formatMessage(messages.continueButton)}
            testID="walletFormContinueButton"
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

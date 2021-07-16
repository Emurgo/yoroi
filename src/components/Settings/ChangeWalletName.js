// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withStateHandlers, withHandlers} from 'recompose'
import {View, ScrollView, KeyboardAvoidingView, Platform} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import _ from 'lodash'

import {Button, ValidatedTextInput, StatusBar} from '../UiKit'
import {walletNameSelector, walletNamesSelector} from '../../selectors'
import {changeWalletName} from '../../actions'
import {withNavigationTitle} from '../../utils/renderUtils'
import {getWalletNameError, validateWalletName} from '../../utils/validators'
import globalMessages from '../../i18n/global-messages'

import styles from './styles/ChangeWalletName.style'

import type {WalletNameValidationErrors} from '../../utils/validators'
import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.settings.changewalletname.title',
    defaultMessage: 'Change wallet name',
  },
  changeButton: {
    id: 'components.settings.changewalletname.changeButton',
    defaultMessage: 'Change name',
  },
  walletNameInputLabel: {
    id: 'components.settings.changewalletname.walletNameInputLabel',
    defaultMessage: 'Wallet name',
  },
})

type Props = {
  walletName: string,
  setWalletName: (string) => any,
  changeAndNavigate: () => any,
  intl: IntlShape,
  validateWalletName: () => WalletNameValidationErrors,
}

const ChangeWalletName = ({
  walletName,
  setWalletName,
  changeAndNavigate,
  intl,
  validateWalletName,
}: Props) => {
  const validationErrors = validateWalletName()

  return (
    <KeyboardAvoidingView
      enabled={Platform.OS === 'ios'}
      behavior="padding"
      style={styles.keyboardAvoidingView}
    >
      <StatusBar type="dark" />

      <SafeAreaView style={styles.safeAreaView}>
        <ScrollView keyboardDismissMode="on-drag">
          <ValidatedTextInput
            label={intl.formatMessage(messages.walletNameInputLabel)}
            value={walletName}
            onChangeText={setWalletName}
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
        </ScrollView>
        <View style={styles.action}>
          <Button
            onPress={changeAndNavigate}
            title={intl.formatMessage(messages.changeButton)}
            disabled={!_.isEmpty(validationErrors)}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

export default injectIntl(
  (compose(
    connect(
      (state) => ({
        oldName: walletNameSelector(state),
        walletNames: walletNamesSelector(state),
      }),
      {changeWalletName},
    ),
    withNavigationTitle(({intl}: {intl: IntlShape}) =>
      intl.formatMessage(messages.title),
    ),
    withStateHandlers(
      ({oldName}) => ({
        walletName: oldName,
      }),
      {
        setWalletName: () => (value) => ({walletName: value}),
      },
    ),
    withHandlers({
      validateWalletName: ({walletName, oldName, walletNames}) => () =>
        validateWalletName(walletName, oldName, walletNames),
    }),
    withHandlers({
      changeAndNavigate: ({
        navigation,
        walletName,
        changeWalletName,
        validateWalletName,
      }) => async () => {
        if (!_.isEmpty(validateWalletName())) return

        await changeWalletName(walletName)
        navigation.goBack()
      },
    }),
  )(ChangeWalletName): ComponentType<{|
    navigation: Navigation,
    route: any,
    intl: IntlShape,
  |}>),
)

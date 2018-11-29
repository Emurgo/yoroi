// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withState, withHandlers} from 'recompose'
import {View, KeyboardAvoidingView, Platform} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import _ from 'lodash'

import {Button, ValidatedTextInput} from '../UiKit'
import {walletNameSelector, walletNamesSelector} from '../../selectors'
import {changeWalletName, showErrorDialog} from '../../actions'
import {withNavigationTitle} from '../../utils/renderUtils'
import {getWalletNameError, validateWalletName} from '../../utils/validators'

import styles from './styles/ChangeWalletName.style'

import type {SubTranslation} from '../../l10n/typeHelpers'
import type {WalletNameValidationErrors} from '../../utils/validators'

const getTranslations = (state) => state.trans.ChangeWalletNameScreen
const getErrorTranslations = (state) => state.trans.WalletNameAndPasswordForm

type Props = {
  newName: string,
  oldName: string,
  walletNames: Array<string>,
  onChangeText: (string) => void,
  changeAndNavigate: () => void,
  translations: SubTranslation<typeof getTranslations>,
  errorTranslations: SubTranslation<typeof getErrorTranslations>,
  validateWalletName: () => WalletNameValidationErrors,
}

const ChangeWalletName = ({
  newName,
  onChangeText,
  changeAndNavigate,
  translations,
  errorTranslations,
  validateWalletName,
}: Props) => {
  const validationErrors = validateWalletName()

  return (
    <KeyboardAvoidingView
      enabled={Platform.OS === 'ios'}
      behavior="padding"
      style={styles.keyboardAvoidingView}
    >
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.content}>
          <ValidatedTextInput
            label={translations.walletName}
            value={newName}
            onChange={onChangeText}
            error={getWalletNameError(errorTranslations, validationErrors)}
          />
        </View>
        <View style={styles.action}>
          <Button
            onPress={changeAndNavigate}
            title={translations.changeButtonText}
            disabled={!_.isEmpty(validationErrors)}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

export default compose(
  connect(
    (state) => ({
      translations: getTranslations(state),
      errorTranslations: getErrorTranslations(state),
      oldName: walletNameSelector(state),
      walletNames: walletNamesSelector(state),
    }),
    {changeWalletName},
  ),
  withNavigationTitle(({translations}) => translations.title),
  withState('newName', 'setNewName', ({oldName}) => oldName),
  withHandlers({
    validateWalletName: ({newName, oldName, walletNames}) => () =>
      validateWalletName(newName, oldName, walletNames),
  }),
  withHandlers({
    onChangeText: ({setNewName}) => (value) => setNewName(value),
    changeAndNavigate: ({
      navigation,
      newName,
      changeWalletName,
      translations,
      validateWalletName,
    }) => async () => {
      if (!_.isEmpty(validateWalletName(newName))) return

      try {
        await changeWalletName(newName)
        navigation.goBack()
      } catch (e) {
        await showErrorDialog((dialogs) => dialogs.general)
      }
    },
  }),
)(ChangeWalletName)

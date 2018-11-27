// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withState, withHandlers} from 'recompose'
import {View, KeyboardAvoidingView, Platform} from 'react-native'
import {SafeAreaView} from 'react-navigation'

import {Button, ValidatedTextInput} from '../UiKit'
import {validateWalletName} from '../../utils/validators'
import {walletNameSelector} from '../../selectors'
import {changeWalletName, showErrorDialog} from '../../actions'
import {withNavigationTitle} from '../../utils/renderUtils'

import styles from './styles/ChangeWalletName.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.ChangeWalletName

type Props = {
  newName: string,
  onChangeText: (string) => void,
  changeAndNavigate: () => void,
  translations: SubTranslation<typeof getTranslations>,
}

const ChangeWalletName = ({
  newName,
  onChangeText,
  changeAndNavigate,
  translations,
}: Props) => {
  const validationErrors = validateWalletName(newName)

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
            error={validationErrors && translations.walletValidationText}
          />
        </View>
        <Button
          onPress={changeAndNavigate}
          title={translations.changeButtonText}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

export default compose(
  connect(
    (state) => ({
      translations: getTranslations(state),
      oldName: walletNameSelector(state),
    }),
    {changeWalletName},
  ),
  withNavigationTitle(({translations}) => translations.title),
  withState('newName', 'setNewName', ({oldName}) => oldName),
  withHandlers({
    onChangeText: ({setNewName}) => (value) => setNewName(value),
    changeAndNavigate: ({
      navigation,
      newName,
      changeWalletName,
      translations,
    }) => async () => {
      if (validateWalletName(newName)) return

      try {
        await changeWalletName(newName)

        navigation.goBack()
      } catch (e) {
        await showErrorDialog((dialogs) => dialogs.general)
      }
    },
  }),
)(ChangeWalletName)

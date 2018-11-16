// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withState, withHandlers} from 'recompose'
import {
  Alert,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import {SafeAreaView} from 'react-navigation'

import {Button, Text} from '../UiKit'
import {validateWalletName} from '../../utils/validators'
import {walletNameSelector} from '../../selectors'
import {changeWalletName} from '../../actions'
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
          {validationErrors && <Text>{translations.walletValidationText}</Text>}
          <TextInput
            style={styles.inputText}
            placeholder={translations.walletName}
            value={newName}
            onChangeText={onChangeText}
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
        Alert.alert(
          translations.errorDialog.title,
          translations.errorDialog.text,
          [{text: translations.errorDialog.ok}],
        )
      }
    },
  }),
)(ChangeWalletName)

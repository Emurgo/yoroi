// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withState, withHandlers} from 'recompose'
import {View, TextInput, KeyboardAvoidingView, Platform} from 'react-native'
import {SafeAreaView} from 'react-navigation'

import {Button, Text} from '../UiKit'
import {validateWalletName} from '../../utils/validators'

import styles from './styles/ChangeWalletName.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.ChangeWalletName

type Props = {
  walletName: string,
  onChangeText: (string) => void,
  changeAndNavigate: () => void,
  translations: SubTranslation<typeof getTranslations>,
}

const ChangeWalletName = ({
  walletName,
  onChangeText,
  changeAndNavigate,
  translations,
}: Props) => {
  const validationErrors = validateWalletName(walletName)

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
            value={walletName}
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
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withState('walletName', 'setWalletName', 'getWalletNameFromApp()'),
  withState('validateResult', 'setValidateResult', true),
  withHandlers({
    onChangeText: ({setWalletName, setValidateResult}) => (walletName) => {
      setWalletName(walletName)
      setValidateResult(validateWalletName(walletName))
    },
    changeAndNavigate: ({navigation, walletName}) => () => {
      if (validateWalletName(walletName) === null) {
        // saveWalletNameToApp()
        navigation.goBack()
      }
    },
  }),
)(ChangeWalletName)

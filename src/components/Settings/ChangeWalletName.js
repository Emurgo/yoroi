// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withState, withHandlers} from 'recompose'
import {View, TextInput} from 'react-native'

import {Button, Text} from '../UiKit'
import {validateWalletName} from '../../utils/validators'

import styles from './styles/ChangeWalletName.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.changeWalletName

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
    <View style={styles.root}>
      <View>
        {validationErrors &&
          validationErrors.walletNameLength && (
          <Text>{translations.walletValidationText}</Text>
        )}
        <TextInput
          style={styles.inputText}
          placeholder={translations.walletName}
          onChangeText={onChangeText}
        />
      </View>
      <Button
        onPress={changeAndNavigate}
        title={translations.changeButtonText}
      />
    </View>
  )
}

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  // getWalletNameFromApp()
  withState('walletName', 'setWalletName', ''),
  // resultFromStatePreviousLine
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

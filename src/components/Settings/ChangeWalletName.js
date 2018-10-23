// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {View, TextInput} from 'react-native'

import {Button} from '../UiKit'

import styles from './styles/ChangeWalletName.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.changeWalletName

type Props = {
  acceptAndNavigate: () => void,
  translations: SubTranslation<typeof getTranslations>,
}

const ChangeWalletName = ({acceptAndNavigate, translations}: Props) => (
  <View style={styles.root}>
    <TextInput style={styles.inputText} placeholder={translations.walletName} />
    <Button onPress={acceptAndNavigate} title={translations.changeButtonText} />
  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withHandlers({
    acceptAndNavigate: ({navigation}) => () => navigation.goBack(),
  }),
)(ChangeWalletName)

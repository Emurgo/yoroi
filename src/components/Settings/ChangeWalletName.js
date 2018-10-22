// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {View, TextInput} from 'react-native'

import {Button} from '../UiKit'

import styles from './styles/ChangeWalletName.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslation = (state) => state.trans.changeWalletName

type Props = {
  acceptAndNavigate: () => void,
  translation: SubTranslation<typeof getTranslation>,
}

const ChangeWalletName = ({acceptAndNavigate, translation}: Props) => (
  <View style={styles.root}>
    <TextInput style={styles.inputText} placeholder={translation.walletName} />
    <Button onPress={acceptAndNavigate} title={translation.changeButtonText} />
  </View>
)

export default compose(
  connect((state) => ({
    translation: getTranslation(state),
  })),
  withHandlers({
    acceptAndNavigate: ({navigation}) => () => navigation.goBack(),
  }),
)(ChangeWalletName)

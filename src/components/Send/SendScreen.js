// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View, TextInput, TouchableOpacity} from 'react-native'
import {withHandlers} from 'recompose'

import {SEND_ROUTES} from '../../RoutesList'
import {Text, Button} from '../UiKit'

import styles from './styles/SendScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.SendScreen

type Props = {
  navigateToAddressReaderQR: () => mixed,
  navigateToConfirm: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
}

const SendScreen = ({
  navigateToConfirm,
  navigateToAddressReaderQR,
  translations,
}: Props) => (
  <View style={styles.root}>
    <View style={styles.header}>
      <Text>{translations.funds}</Text>
    </View>
    <View style={styles.containerQR}>
      <TouchableOpacity onPress={navigateToAddressReaderQR}>
        <View style={styles.scanIcon} />
      </TouchableOpacity>
      <Text style={styles.label}>{translations.scanCode}</Text>
    </View>
    <View style={styles.inputContainer}>
      <TextInput style={styles.inputText} placeholder={translations.address} />
      <TextInput style={styles.inputText} placeholder={translations.amount} />
    </View>

    <Button onPress={navigateToConfirm} title={translations.continue} />
  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withHandlers({
    navigateToAddressReaderQR: ({navigation}) => (event) =>
      navigation.navigate(SEND_ROUTES.ADDRESS_READER_QR),
    navigateToConfirm: ({navigation}) => (event) =>
      navigation.navigate(SEND_ROUTES.CONFIRM),
  }),
)(SendScreen)

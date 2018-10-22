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

const getTrans = (state) => state.trans.SendScreen

type Props = {
  navigateToAddressReaderQR: () => mixed,
  navigateToConfirm: () => mixed,
  trans: SubTranslation<typeof getTrans>,
}

const SendScreen = ({navigateToConfirm, navigateToAddressReaderQR, trans}: Props) => (
  <View style={styles.root}>
    <View style={styles.header}>
      <Text>Available funds:</Text>
    </View>
    <View style={styles.containerQR}>
      <TouchableOpacity onPress={navigateToAddressReaderQR}>
        <View style={styles.scanIcon} />
      </TouchableOpacity>
      <Text style={styles.label}>Scan QR code</Text>
    </View>
    <View style={styles.inputContainer}>
      <TextInput style={styles.inputText} placeholder={'Address'} />
      <TextInput style={styles.inputText} placeholder={'Amount'} />
    </View>

    <Button
      onPress={navigateToConfirm}
      title={trans.continue}
    />
  </View>
)

export default compose(
  connect((state) => ({
    trans: getTrans(state),
  })),
  withHandlers({
    navigateToAddressReaderQR: ({navigation}) => (event) =>
      navigation.navigate(SEND_ROUTES.ADDRESS_READER_QR),
    navigateToConfirm: ({navigation}) => (event) =>
      navigation.navigate(SEND_ROUTES.CONFIRM),
  })
)(SendScreen)

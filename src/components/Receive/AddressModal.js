import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withState, withHandlers} from 'recompose'
import {Modal, Clipboard, View} from 'react-native'
import QRCode from 'react-native-qrcode'

import {Text, Button} from '../UiKit'

import styles from './styles/AddressModal.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.receiveScreenModal

type Props = {
  address: string,
  isVisible: boolean,
  setVisible: (boolean) => void,
  isClicked: boolean,
  setClicked: (boolean) => void,
  copyAddress: () => void,
  translations: SubTranslation<typeof getTranslations>,
  onClose: () => void,
}

const AddressModal = ({
  address,
  isVisible,
  setVisible,
  isClicked,
  setClicked,
  copyAddress,
  translations,
  onClose,
}: Props) => (
  <Modal visible={isVisible} onRequestClose={onClose}>
    <View style={styles.root}>
      <View style={styles.container}>
        <QRCode
          value={address}
          size={styles.qrcode.size}
          bgColor={styles.qrcode.backgroundColor}
          fgColor={styles.qrcode.foregroundColor}
        />
      </View>

      <View style={styles.container}>
        <Text style={styles.address}>{address}</Text>
      </View>

      <View style={styles.container}>
        <Button
          onPress={copyAddress}
          title={isClicked ? translations.copiedLabel : translations.copyLabel}
        />
      </View>
    </View>
  </Modal>
)

export default compose(
  connect((state, {navigation}) => ({
    address: navigation.getParam('address'),
    translations: getTranslations(state),
  })),
  withState('isVisible', 'setVisible', true),
  withState('isClicked', 'setClicked', false),
  withHandlers({
    copyAddress: ({address, setClicked}) => () => {
      Clipboard.setString(address)
      setClicked(true)
    },
    onClose: ({navigation}) => () => navigation.goBack(),
  }),
)(AddressModal)

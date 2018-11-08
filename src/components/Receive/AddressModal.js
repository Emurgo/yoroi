// @flow

import React from 'react'
import {connect} from 'react-redux'
import {Modal, Clipboard, View} from 'react-native'
import QRCode from 'react-native-qrcode'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'

import {Text, Button} from '../UiKit'

import styles from './styles/AddressModal.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.AddressModal

type Props = {
  address: string,
  translations: SubTranslation<typeof getTranslations>,
  navigation: NavigationScreenProp<NavigationState>,
}

type State = {
  isCopied: boolean,
}

class AddressModal extends React.Component<Props, State> {
  state = {isCopied: false}

  _hideModalTimeoutId = null

  componentWillUnmount() {
    if (this._hideModalTimeoutId) clearTimeout(this._hideModalTimeoutId)
  }

  _copyAddress = () => {
    Clipboard.setString(this.props.address)
    this.setState({isCopied: true})

    this._hideModalTimeoutId = setTimeout(
      () => this.props.navigation.goBack(),
      1000,
    )
  }

  render() {
    const {isCopied} = this.state
    const {address, translations, navigation} = this.props

    return (
      <Modal visible onRequestClose={navigation.goBack}>
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
              onPress={this._copyAddress}
              title={
                isCopied ? translations.copiedLabel : translations.copyLabel
              }
            />
          </View>
        </View>
      </Modal>
    )
  }
}

export default connect(
  (state, {navigation}) => ({
    address: navigation.getParam('address'),
    translations: getTranslations(state),
  }),
  null,
)(AddressModal)

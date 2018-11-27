// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Clipboard, View, TouchableOpacity} from 'react-native'
import QRCode from 'react-native-qrcode'

import {externalAddressIndexSelector} from '../../selectors'
import {formatBIP44} from '../../crypto/util'

import {Text, Button, Modal} from '../UiKit'

import styles from './styles/AddressModal.style'

import type {ComponentType} from 'react'
import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.AddressDetailsModal

type Props = {
  address: ?string,
  index?: number,
  translations: SubTranslation<typeof getTranslations>,
  onRequestClose: () => any,
  visible: boolean,
}

type State = {
  isCopied: boolean,
}

class AddressModal extends React.Component<Props, State> {
  state = {isCopied: false}

  /* eslint-disable-next-line react/sort-comp */
  _hideModalTimeoutId = null

  componentWillUnmount() {
    if (this._hideModalTimeoutId) clearTimeout(this._hideModalTimeoutId)
  }

  _copyAddress = () => {
    if (!this.props.address) return
    Clipboard.setString(this.props.address)
    this.setState({isCopied: true})

    this._hideModalTimeoutId = setTimeout(
      () => this.props.onRequestClose(),
      1000,
    )
  }

  render() {
    const {isCopied} = this.state
    const {address, index, translations, onRequestClose, visible} = this.props

    return (
      <Modal visible={visible} onRequestClose={onRequestClose}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.close} onPress={onRequestClose}>
            <Text style={styles.closeText}>{'\u00d7'}</Text>
          </TouchableOpacity>
          <View style={styles.content}>
            <QRCode value={address} size={140} bgColor="#000" fgColor="#fff" />

            {index != null && (
              <Text style={styles.address}>
                {translations.BIP32path} {formatBIP44(0, 'External', index)}
              </Text>
            )}
            <Text style={styles.address}>{address}</Text>
          </View>

          <Button
            onPress={this._copyAddress}
            title={isCopied ? translations.copiedLabel : translations.copyLabel}
          />
        </View>
      </Modal>
    )
  }
}

type ExternalProps = {
  address: ?string,
  onRequestClose: () => any,
  visible: boolean,
}

export default (compose(
  connect(
    (state, {address}) => ({
      translations: getTranslations(state),
      index: externalAddressIndexSelector(state)[address],
    }),
    null,
  ),
)(AddressModal): ComponentType<ExternalProps>)

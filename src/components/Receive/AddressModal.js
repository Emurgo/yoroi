// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Clipboard, View} from 'react-native'
import QRCode from 'react-native-qrcode'
import {injectIntl, defineMessages} from 'react-intl'

import {externalAddressIndexSelector} from '../../selectors'
import {formatBIP44} from '../../crypto/util'

import {Text, Button, Modal} from '../UiKit'

import styles from './styles/AddressModal.style'

import type {ComponentType} from 'react'

const messages = defineMessages({
  walletAddress: {
    id: 'components.receive.addressmodal.walletAddress',
    defaultMessage: '!!!Your wallet address',
    description: 'some desc',
  },
  BIP32path: {
    id: 'components.receive.addressmodal.BIP32path',
    defaultMessage: '!!!BIP32 path:',
    description: 'some desc',
  },
  copyLabel: {
    id: 'components.receive.addressmodal.copyLabel',
    defaultMessage: '!!!Copy address',
    description: 'some desc',
  },
  copiedLabel: {
    id: 'components.receive.addressmodal.copiedLabel',
    defaultMessage: '!!!Copied',
    description: 'some desc',
  },
})

type Props = {
  address: ?string,
  index?: number,
  intl: any,
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

  async componentDidUpdate() {
    const cbData = await Clipboard.getString()
    if (this.state.isCopied && cbData !== this.props.address) {
      // eslint-disable-next-line
      this.setState({isCopied: false})
    }
  }

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
    const {address, index, intl, onRequestClose, visible} = this.props

    return (
      <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
        <View style={styles.content}>
          <QRCode value={address} size={140} bgColor="black" fgColor="white" />

          {index != null && (
            <Text style={styles.address}>
              {intl.formatMessage(messages.BIP32path)} {formatBIP44(0, 'External', index)}
            </Text>
          )}
          <Text monospace style={styles.address}>
            {address}
          </Text>
        </View>

        <Button
          onPress={this._copyAddress}
          title={isCopied ?
            intl.formatMessage(messages.copiedLabel) :
            intl.formatMessage(messages.copyLabel)}
        />
      </Modal>
    )
  }
}

type ExternalProps = {
  address: ?string,
  onRequestClose: () => any,
  visible: boolean,
}

export default injectIntl(compose(
  connect(
    (state, {address}) => ({
      index: externalAddressIndexSelector(state)[address],
    }),
    null,
  ),
)(AddressModal): ComponentType<ExternalProps>)

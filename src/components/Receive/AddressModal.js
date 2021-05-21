// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import QRCode from 'react-native-qrcode-svg'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {
  externalAddressIndexSelector,
  isHWSelector,
  walletMetaSelector,
} from '../../selectors'
import {formatPath} from '../../crypto/commonUtils'

import {Text, Button, Modal} from '../UiKit'

import styles from './styles/AddressModal.style'

import type {ComponentType} from 'react'
import type {WalletMeta} from '../../state'

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
  verifyLabel: {
    id: 'components.receive.addressverifymodal.title',
    defaultMessage: '!!!Verify Address on Ledger',
  },
})

type Props = {|
  address: ?string,
  index?: number,
  intl: IntlShape,
  onRequestClose: () => any,
  visible: boolean,
  onAddressVerify: () => void,
  isHW: boolean,
  walletMeta: WalletMeta,
|}

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
    if (this.props.address == null) return
    Clipboard.setString(this.props.address)
    this.setState({isCopied: true})

    // To avoid reading the clipboard, we simply reset state once the modal
    // is closed
    this._hideModalTimeoutId = setTimeout(() => {
      this.props.onRequestClose()
      this.setState({isCopied: false})
    }, 1000)
  }

  render() {
    const {isCopied} = this.state
    const {
      address,
      index,
      intl,
      onRequestClose,
      visible,
      onAddressVerify,
      isHW,
      walletMeta,
    } = this.props

    return (
      <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
        <View style={styles.content}>
          <QRCode
            value={address}
            size={140}
            backgroundColor="white"
            color="black"
          />

          {index != null && (
            <Text style={styles.address}>
              {intl.formatMessage(messages.BIP32path)}{' '}
              {formatPath(
                0,
                'External',
                index,
                walletMeta.walletImplementationId,
              )}
            </Text>
          )}
          <Text monospace style={styles.address}>
            {address !== undefined ? address : null}
          </Text>
        </View>

        <Button
          onPress={this._copyAddress}
          title={
            isCopied
              ? intl.formatMessage(messages.copiedLabel)
              : intl.formatMessage(messages.copyLabel)
          }
        />
        {isHW && (
          <Button
            onPress={onAddressVerify}
            title={intl.formatMessage(messages.verifyLabel)}
            style={styles.button}
          />
        )}
      </Modal>
    )
  }
}

type ExternalProps = {|
  address: ?string,
  onRequestClose: () => any,
  visible: boolean,
  intl: IntlShape,
  onAddressVerify: () => void,
|}

export default injectIntl(
  (compose(
    connect(
      (state, {address}) => ({
        index: externalAddressIndexSelector(state)[address],
        isHW: isHWSelector(state),
        walletMeta: walletMetaSelector(state),
      }),
      null,
    ),
  )(AddressModal): ComponentType<ExternalProps>),
)

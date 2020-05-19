// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Clipboard, View} from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {externalAddressIndexSelector, isHWSelector} from '../../selectors'
import {formatBIP44} from '../../crypto/byron/util'

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

type Props = {|
  address: ?string,
  index?: number,
  intl: any,
  onRequestClose: () => any,
  visible: boolean,
  onAddressVerify: () => void,
  isHW: boolean,
|}

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
    if (this.props.address == null) return
    Clipboard.setString(this.props.address)
    this.setState({isCopied: true})

    this._hideModalTimeoutId = setTimeout(
      () => this.props.onRequestClose(),
      1000,
    )
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
              {formatBIP44(0, 'External', index)}
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
            title={
              /* TODO */
              'Verify address with Ledger'
            }
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
  intl: intlShape,
  onAddressVerify: () => void,
|}

export default injectIntl(
  (compose(
    connect(
      (state, {address}) => ({
        index: externalAddressIndexSelector(state)[address],
        isHW: isHWSelector(state),
      }),
      null,
    ),
  )(AddressModal): ComponentType<ExternalProps>),
)

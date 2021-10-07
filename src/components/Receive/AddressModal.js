// @flow

import Clipboard from '@react-native-community/clipboard'
import React from 'react'
import {type IntlShape, defineMessages, useIntl} from 'react-intl'
import {Image, TouchableOpacity, View} from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import {useSelector} from 'react-redux'

import copiedIcon from '../../assets/img/icon/copied.png'
import copyIcon from '../../assets/img/icon/copy-ext.png'
import {formatPath} from '../../crypto/commonUtils'
import type {AddressDTOCardano, KeyHashesCardano} from '../../crypto/shelley/Address.dto'
import {externalAddressIndexSelector, isHWSelector, walletMetaSelector} from '../../selectors'
import type {WalletMeta} from '../../state'
import {Button, Modal, Text} from '../UiKit'
import styles from './styles/AddressModal.style'

type Props = {|
  addressInfo: ?AddressDTOCardano,
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
  keyHashes: KeyHashesCardano | null,
}

// eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
class AddressModal extends React.Component<Props, State> {
  state = {isCopied: false, keyHashes: null}

  /* eslint-disable-next-line react/sort-comp */
  _hideModalTimeoutId = null

  /* eslint-disable-next-line camelcase */
  async UNSAFE_componentWillMount(): Promise<void> {
    const {addressInfo} = this.props
    this.setState({
      keyHashes: await addressInfo?.getKeyHashes(),
    })
  }

  componentWillUnmount() {
    if (this._hideModalTimeoutId) clearTimeout(this._hideModalTimeoutId)
  }

  _copyAddress = () => {
    if (this.props.addressInfo == null) return
    Clipboard.setString(this.props.addressInfo.address)
    this.setState({isCopied: true})

    // To avoid reading the clipboard, we simply reset state once the modal
    // is closed
    this._hideModalTimeoutId = setTimeout(() => {
      this.props.onRequestClose()
      this.setState({isCopied: false})
    }, 1000)
  }

  render() {
    const {isCopied, keyHashes} = this.state
    const {addressInfo, index, intl, onRequestClose, visible, onAddressVerify, isHW, walletMeta} = this.props

    return (
      <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
        <View style={styles.container}>
          <Text style={styles.title}>{intl.formatMessage(messages.title).toLocaleUpperCase()}</Text>
          <QRCode value={addressInfo?.address} size={140} backgroundColor="white" color="black" />
          <View style={styles.info}>
            <Text style={styles.subtitle}>{intl.formatMessage(messages.walletAddress)}</Text>
            <View style={styles.dataContainer}>
              <Text secondary monospace numberOfLines={1} ellipsizeMode="middle">
                {addressInfo?.address}
              </Text>
              <TouchableOpacity
                accessibilityLabel={intl.formatMessage(messages.copyLabel)}
                accessibilityRole="button"
                onPress={this._copyAddress}
              >
                <Image source={isCopied ? copiedIcon : copyIcon} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>{intl.formatMessage(messages.BIP32path)}</Text>
            <Text secondary monospace>
              {index != null && <>{formatPath(0, 'External', index, walletMeta.walletImplementationId)}</>}
            </Text>
            <Text style={styles.subtitle}>{intl.formatMessage(messages.staking)}</Text>
            <Text secondary monospace>
              {keyHashes?.staking}
            </Text>
            <Text style={styles.subtitle}>{intl.formatMessage(messages.spending)}</Text>
            <Text secondary monospace>
              {keyHashes?.spending}
            </Text>
          </View>
        </View>

        {isHW && (
          <Button onPress={onAddressVerify} title={intl.formatMessage(messages.verifyLabel)} style={styles.button} />
        )}
      </Modal>
    )
  }
}

type ExternalProps = {|
  addressInfo: ?AddressDTOCardano,
  onRequestClose: () => any,
  visible: boolean,
  onAddressVerify: () => void,
|}

export default (props: ExternalProps) => {
  const intl = useIntl()
  const index = useSelector(externalAddressIndexSelector)[props.addressInfo?.address]
  const isHW = useSelector(isHWSelector)
  const walletMeta = useSelector(walletMetaSelector)

  // $FlowFixMe
  return <AddressModal intl={intl} index={index} isHW={isHW} walletMeta={walletMeta} {...props} />
}

const messages = defineMessages({
  walletAddress: {
    id: 'components.receive.addressmodal.walletAddress',
    defaultMessage: '!!!Your wallet address',
  },
  BIP32path: {
    id: 'components.receive.addressmodal.BIP32path',
    defaultMessage: '!!!BIP32 path:',
  },
  copyLabel: {
    id: 'components.receive.addressmodal.copyLabel',
    defaultMessage: '!!!Copy address',
  },
  spending: {
    id: 'components.receive.addressmodal.spendingKeyHash',
    defaultMessage: '!!!Spending',
  },
  staking: {
    id: 'components.receive.addressmodal.stakingKeyHash',
    defaultMessage: '!!!Staking',
  },
  title: {
    id: 'components.receive.addressmodal.title',
    defaultMessage: '!!!Title',
  },
  verifyLabel: {
    id: 'components.receive.addressverifymodal.title',
    defaultMessage: '!!!Verify Address on Ledger',
  },
})

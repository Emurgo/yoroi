import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'
import QRCode from 'react-native-qrcode'

import CopyButton from './CopyButton'
import {Text} from '../UiKit'

import styles from './styles/ReceiveAddressDetail.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslation = (state) => state.trans.receiveScreen

type Props = {
  receiveAddress: string,
  translation: SubTranslation<typeof getTranslation>,
}

const ReceiveAddressDetail = ({receiveAddress, translation}: Props) => (
  <View style={styles.container}>
    <View style={styles.qrContainer}>
      <QRCode
        value={receiveAddress}
        size={styles.qrcode.size}
        bgColor={styles.qrcode.backgroundColor}
        fgColor={styles.qrcode.foregroundColor}
      />
    </View>

    <Text style={styles.addressLabel}>{translation.walletAddress}</Text>
    <Text style={styles.address}>{receiveAddress}</Text>
    <CopyButton value={receiveAddress} />
  </View>
)

export default compose(
  connect((state) => ({
    translation: getTranslation(state),
  }))
)(ReceiveAddressDetail)

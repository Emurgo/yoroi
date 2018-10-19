import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'
import QRCode from 'react-native-qrcode'

import AddressView from './AddressView'
import {Text} from '../UiKit'

import styles from './styles/AddressDetail.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslation = (state) => state.trans.receiveScreen

type Props = {
  address: string,
  translation: SubTranslation<typeof getTranslation>,
}

const AddressDetail = ({address, translation}: Props) => (
  <View style={styles.container}>
    <View style={styles.qrContainer}>
      <QRCode
        value={address}
        size={styles.qrcode.size}
        bgColor={styles.qrcode.backgroundColor}
        fgColor={styles.qrcode.foregroundColor}
      />
    </View>

    <Text style={styles.addressLabel}>{translation.walletAddress}</Text>
    <AddressView address={address} />
  </View>
)

export default compose(
  connect((state) => ({
    translation: getTranslation(state),
  }))
)(AddressDetail)

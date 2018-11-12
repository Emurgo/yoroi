// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'
import QRCode from 'react-native-qrcode'

import AddressView from './AddressView'
import {Text} from '../UiKit'

import styles from './styles/AddressDetail.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.AddressDetail

type Props = {
  address: string,
  index: number,
  isUsed: boolean,
  translations: SubTranslation<typeof getTranslations>,
}

const AddressDetail = ({address, index, isUsed, translations}: Props) => (
  <View style={styles.container}>
    <View style={styles.qrContainer}>
      <QRCode
        value={address}
        size={styles.qrcode.size}
        bgColor={styles.qrcode.backgroundColor}
        fgColor={styles.qrcode.foregroundColor}
      />
    </View>

    <Text style={styles.addressLabel}>{translations.walletAddress}</Text>
    <AddressView index={index} address={address} isUsed={isUsed} />
  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
)(AddressDetail)

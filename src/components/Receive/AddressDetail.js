// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'
import QRCode from 'react-native-qrcode'

import styles from './styles/AddressDetail.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.AddressDetail

type Props = {
  address: string,
  translations: SubTranslation<typeof getTranslations>,
}

const AddressDetail = ({address, translations}: Props) => (
  <View style={styles.container}>
    <View style={styles.qrContainer}>
      <QRCode
        value={address}
        size={styles.qrcode.size}
        bgColor={styles.qrcode.backgroundColor}
        fgColor={styles.qrcode.foregroundColor}
      />
    </View>
  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
)(AddressDetail)

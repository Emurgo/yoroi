// @flow

import React from 'react'
import {View} from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import {COLORS} from '../../styles/config'
import styles from './styles/AddressDetail.style'

type Props = {
  address: string,
}

const AddressDetail = ({address}: Props) => (
  <View style={styles.container}>
    <QRCode value={address} size={140} backgroundColor={COLORS.LIGHT_GRAY} color="black" />
  </View>
)

export default AddressDetail

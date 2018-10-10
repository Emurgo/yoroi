import React from 'react'
import {View} from 'react-native'
import QRCode from 'react-native-qrcode'

import CustomText from '../../components/CustomText'

import styles from './styles/ReceiveAddressDetail.style'

type Props = {
  receiveAddress: string,
};

const ReceiveAddressDetail = ({receiveAddress}: Props) => (
  <View style={styles.container}>
    <View style={styles.qrContainer}>
      <QRCode
        value={receiveAddress}
        size={200}
        bgColor={styles.qrcode.backgroundColor}
        fgColor={styles.qrcode.foregroundColor}
      />
    </View>

    <CustomText style={styles.addressLabel}>i18nYour wallet address</CustomText>
    <CustomText style={styles.address}>{receiveAddress}</CustomText>
  </View>
)

export default ReceiveAddressDetail

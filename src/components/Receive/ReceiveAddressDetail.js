import React from 'react'
import {View} from 'react-native'
import QRCode from 'react-native-qrcode'

import CustomText from '../../components/CustomText'
import type {SubTranslation} from '../../l10n/typeHelpers'

import styles from './styles/ReceiveAddressDetail.style'

const getTranslation = (state) => state.trans.receiveScreen

type Props = {
  receiveAddress: string,
  translation: SubTranslation<typeof getTranslation>,
};

const ReceiveAddressDetail = ({receiveAddress, translation}: Props) => (
  <View style={styles.container}>
    <View style={styles.qrContainer}>
      <QRCode
        value={receiveAddress}
        size={200}
        bgColor={styles.qrcode.backgroundColor}
        fgColor={styles.qrcode.foregroundColor}
      />
    </View>

    <CustomText style={styles.addressLabel}>{translation.walletAddress}</CustomText>
    <CustomText style={styles.address}>{receiveAddress}</CustomText>
  </View>
)

export default ReceiveAddressDetail

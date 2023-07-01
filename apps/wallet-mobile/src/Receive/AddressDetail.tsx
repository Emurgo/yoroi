import React from 'react'
import {StyleSheet, View} from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import {COLORS} from '../theme'

type Props = {
  address: string
}

export const AddressDetail = ({address}: Props) => (
  <View style={styles.container}>
    <QRCode value={address} size={140} backgroundColor={COLORS.LIGHT_GRAY} color="black" />
  </View>
)

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.LIGHT_GRAY,
    marginTop: 5,
    marginBottom: 5,
    padding: 15,
    borderRadius: 10,
  },
})

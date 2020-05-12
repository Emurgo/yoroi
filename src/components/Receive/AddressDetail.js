// @flow

import React from 'react'
import QRCode from 'react-native-qrcode-svg'

type Props = {
  address: string,
}

const AddressDetail = ({address}: Props) => (
  <QRCode value={address} size={140} backgroundColor="white" color="black" />
)

export default AddressDetail

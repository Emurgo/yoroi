// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import QRCode from 'react-native-qrcode'

type Props = {
  address: string,
}

const AddressDetail = ({address}: Props) => (
  <QRCode value={address} size={140} bgColor="black" fgColor="white" />
)

export default compose(
  connect((state) => ({
  })),
)(AddressDetail)

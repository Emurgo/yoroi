// @flow

import {useRoute} from '@react-navigation/native'
import React from 'react'
import QRCodeScanner from 'react-native-qrcode-scanner'

const AddressReaderQR = () => {
  const route = useRoute()
  if (typeof route.params?.onSuccess !== 'function') {
    throw new Error("AddressReaderQR requires 'route.params.onSuccess'")
  }

  const onSuccess = ((route.params.onSuccess: any): (data: string) => any)

  return <QRCodeScanner onRead={({data}) => onSuccess(data)} />
}

export default AddressReaderQR

import {useRoute} from '@react-navigation/native'
import React from 'react'
import QRCodeScanner from 'react-native-qrcode-scanner'

export const AddressReaderQR = () => {
  const {params} = useRoute()
  if (!hasCallback(params)) {
    throw new Error("AddressReaderQR requires 'route.params.onSuccess'")
  }

  return <QRCodeScanner onRead={({data}) => params.onSuccess(data)} />
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasCallback = (params: any): params is {onSuccess: (text: string) => void} => {
  return !!params && 'onSuccess' in params && typeof params.onSuccess === 'function'
}

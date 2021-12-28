import {useRoute} from '@react-navigation/native'
import React from 'react'
import QRCodeScanner from 'react-native-qrcode-scanner'

export type Params = {
  onSuccess: (data: string) => void
}

export const AddressReaderQR = () => {
  const route = useRoute()
  const params = route.params
  if (!isParams(params)) {
    throw new Error("AddressReaderQR requires 'route.params.onSuccess'")
  }

  return <QRCodeScanner onRead={({data}) => params.onSuccess(data)} />
}

const isParams = (params: unknown): params is Params => {
  return !!params && typeof params === 'object' && 'onSuccess' in params
}

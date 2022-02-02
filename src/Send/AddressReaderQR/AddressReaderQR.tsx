import React from 'react'
import QRCodeScanner from 'react-native-qrcode-scanner'

import {useParams} from '../../navigation'

export type Params = {
  onSuccess: (data: string) => void
}

export const AddressReaderQR = () => {
  const params = useParams(isParams)

  return <QRCodeScanner onRead={({data}) => params.onSuccess(data)} />
}

const isParams = (params?: Params | object | undefined): params is Params => {
  return typeof params === 'object' && 'onSuccess' in params && typeof params.onSuccess === 'function'
}

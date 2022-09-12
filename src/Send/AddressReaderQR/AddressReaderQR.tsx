import {useNavigation} from '@react-navigation/native'
import {pastedFormatter} from '@yoroi-wallets'
import React from 'react'
import QRCodeScanner from 'react-native-qrcode-scanner'

import {useSend} from '../Context/SendContext'

export const AddressReaderQR = () => {
  const navigation = useNavigation()
  const {receiverChanged, amountChanged} = useSend()

  const handleOnRead = ({data: qrData}) => {
    const regex = /(cardano):([a-zA-Z1-9]\w+)\??/
    if (regex.test(qrData)) {
      const address = qrData.match(regex)?.[2]
      if (qrData.indexOf('?') !== -1) {
        const index = qrData.indexOf('?')
        const params = getParams(qrData.substr(index))
        if ('amount' in params) {
          receiverChanged(address ?? '')
          const amount = pastedFormatter(params?.amount ?? '')
          amountChanged(amount)
        }
      } else {
        receiverChanged(address ?? '')
      }
    } else {
      receiverChanged(qrData ?? '')
    }
    navigation.goBack()
  }

  return <QRCodeScanner onRead={handleOnRead} />
}

const getParams = (params: string) => {
  const query = params.substr(1)
  const result: {amount?: string; address?: string} = {}
  query.split('?').forEach((part) => {
    const item = part.split('=')
    result[item[0]] = decodeURIComponent(item[1])
  })
  return result
}

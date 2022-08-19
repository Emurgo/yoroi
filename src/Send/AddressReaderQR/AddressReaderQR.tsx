import {useNavigation} from '@react-navigation/native'
import React from 'react'
import QRCodeScanner from 'react-native-qrcode-scanner'

import {pastedFormatter} from '../../yoroi-wallets/utils/amountUtils'
import {useSend} from '../Context/SendContext'

export const AddressReaderQR: React.FC = () => {
  const navigation = useNavigation()
  const {sendActions} = useSend()

  const handleOnRead = ({data}) => {
    const regex = /(cardano):([a-zA-Z1-9]\w+)\??/
    if (regex.test(data)) {
      const address = data.match(regex)?.[2]
      if (data.indexOf('?') !== -1) {
        const index = data.indexOf('?')
        const params = getParams(data.substr(index))
        if ('amount' in params) {
          sendActions.setReceiver(address ?? '')
          const amount = pastedFormatter(params?.amount ?? '')
          sendActions.setAmount(amount)
        }
      } else {
        sendActions.setReceiver(address ?? '')
      }
    } else {
      sendActions.setReceiver(data ?? '')
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

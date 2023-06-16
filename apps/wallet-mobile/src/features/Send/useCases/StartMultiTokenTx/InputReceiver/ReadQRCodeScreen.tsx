import {useNavigation} from '@react-navigation/native'
import {BarCodeScanner} from 'expo-barcode-scanner'
import {Camera} from 'expo-camera'
import * as React from 'react'
import {StyleSheet} from 'react-native'

import {TxHistoryRouteNavigation} from '../../../../../navigation'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {Quantity} from '../../../../../yoroi-wallets/types'
import {pastedFormatter} from '../../../../../yoroi-wallets/utils'
import {useSend} from '../../../common/SendContext'

export const ReadQRCodeScreen = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const wallet = useSelectedWallet()
  const {receiverChanged, amountChanged, tokenSelectedChanged} = useSend()

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
          tokenSelectedChanged(wallet.primaryTokenInfo.id)
          amountChanged(amount as Quantity)
        }
      } else {
        receiverChanged(address ?? '')
      }
    } else {
      receiverChanged(qrData ?? '')
    }
    navigation.navigate('send-start-tx')
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

const QRCodeScanner = ({onRead}: {onRead: ({data}: {data: string}) => void}) => {
  const [status, requestPermissions] = Camera.useCameraPermissions()
  const granted = status && status.granted

  React.useEffect(() => {
    if (!granted) {
      requestPermissions()
    }
  }, [granted, requestPermissions])

  const handleBarCodeScanned = ({data}) => {
    onRead({data})
  }

  if (!granted) {
    return null
  }

  return (
    // expo-barcode-scanner issue in android https://github.com/expo/expo/issues/5212
    <Camera
      style={StyleSheet.absoluteFill}
      ratio="16:9"
      barCodeScannerSettings={{
        barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
      }}
      onBarCodeScanned={handleBarCodeScanned}
    />
  )
}

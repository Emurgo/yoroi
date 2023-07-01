import {BarCodeScanner} from 'expo-barcode-scanner'
import {Camera} from 'expo-camera'
import * as React from 'react'
import {StyleSheet} from 'react-native'

export const QRCodeScanner = ({onRead}: {onRead: ({data}: {data: string}) => Promise<boolean>}) => {
  const [status, requestPermissions] = Camera.useCameraPermissions()
  const [qrScanned, setQrScanned] = React.useState(false)
  const granted = status && status.granted

  React.useEffect(() => {
    if (!granted) {
      requestPermissions()
    }
  }, [granted, requestPermissions])

  const handleBarCodeScanned = async (event) => {
    if (!qrScanned) {
      setQrScanned(true)
      const error = await onRead(event)

      if (error) {
        setQrScanned(false)
      }
    }
  }

  if (!granted) {
    return null
  }

  return (
    // expo-barcode-scanner issue in android https://github.com/expo/expo/issues/5212
    // so expo-camera is used
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
